import { useState, useEffect, useCallback } from 'react'
import { fetchSheet, fetchSheetRaw } from '../api/sheetsApi.js'
import {
  processB2BData,
  processTargetBySplit,
  processTargetByCustomer,
  processEstData,
  processShipmentData,
  processShipmentWeekly,
  processB2CData,
  getDateContext,
} from '../utils/dataUtils.js'
import { SHEETS, OVERSEAS_FIXED } from '../config.js'

const REFRESH_MS = 5 * 60 * 1000   // 5분마다 자동 갱신

// "YYYY-MM" 문자열에서 전월 계산
function prevYearMonth(ym) {
  const year  = parseInt(ym.substring(0, 4))
  const month = parseInt(ym.substring(5, 7))
  if (month === 1) return { year: year - 1, month: 12 }
  return { year, month: month - 1 }
}

export function useAllSheets() {
  const [state, setState] = useState({
    loading: true,
    error: null,
    lastUpdated: null,
    b2bRecords:      [],
    targetMap:       {},
    targetB2B:       {},
    targetOverseas:  {},
    targetByCustomer:{},   // { custName: { year: { month: amt } } }
    overseasNames:   new Set(),
    overseasMap:     {},   // 법인명 → [거래처] (Menu 3 법인 행 구성용)
    estByCustomer:   {},   // 거래처 → 예상매출 (Menu 3)
    customerCountry: {},   // 거래처 → 메인유통국가 (Menu 3 B2B 국가별)
    b2cData:         null, // { actPrev, tgtCurr, actCurr }
    estTotal:           0,
    shipmentTotal:      0,
    shipB2BTotal:       0,
    shipOverseasTotal:  0,
    weeklyByCustomer:  {},   // { custName: { prev, curr } } 전주/금주 출하 합산
    weekStart:         null, // "YYYY-MM-DD" 금주 월요일
    currentYear:   null,
    currentMonth:  null,
    prevYear:      null,
    prevMonth:     null,
    detectedYM:    null,
    warnings:      [],
  })

  const load = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }))
    const warnings = []

    try {
      // ── 모든 시트 병렬 fetch ──────────────────────────────
      const [b2b, target, est, ship, expShip, b2cRaw] = await Promise.all([
        fetchSheet(SHEETS.B2B_CLOSED),
        fetchSheet(SHEETS.TARGET_2026),
        fetchSheet(SHEETS.MONTHLY_EST),
        fetchSheet(SHEETS.SHIPMENT),
        fetchSheet(SHEETS.EXPORT_SHIP),
        fetchSheetRaw(SHEETS.B2C),
      ])

      if (b2b.error)    throw new Error(`'B2B 매출 마감 현황' 로드 실패: ${b2b.error}`)
      if (target.error) warnings.push(`목표 시트 미로드: ${target.error}`)
      if (est.error)    warnings.push(`예상매출 시트 미로드: ${est.error}`)
      if (ship.error)   warnings.push(`출하의뢰 시트 미로드: ${ship.error}`)
      if (expShip.error)warnings.push(`수출출하의뢰 시트 미로드: ${expShip.error}`)
      if (b2cRaw.error) warnings.push(`B2C 시트 미로드: ${b2cRaw.error}`)

      // ── 데이터 가공 ───────────────────────────────────────
      const rawB2BRecords = processB2BData(b2b.rows)

      const { totalEst, customerCountry, overseasNames, overseasMap, estByCustomer } =
        processEstData(est.rows)

      // config.js OVERSEAS_FIXED 고정 해외법인 병합
      for (const [법인명, customers] of Object.entries(OVERSEAS_FIXED)) {
        for (const cust of customers) {
          overseasNames.add(cust)
          if (!overseasMap[법인명]) overseasMap[법인명] = []
          if (!overseasMap[법인명].includes(cust)) overseasMap[법인명].push(cust)
        }
      }

      // 국가 정보 보완: '당월 예상매출' 시트 '메인유통국가' 기준 → 없으면 B2B 시트 국가 유지
      const b2bRecords = rawB2BRecords.map(r => ({
        ...r,
        country: customerCountry[r.customer] || r.country || '',
      }))

      const { targetMap, targetB2B, targetOverseas } =
        processTargetBySplit(target.rows, target.headers, overseasNames)

      const { byCustomer: targetByCustomer } =
        processTargetByCustomer(target.rows, target.headers)

      // overseasNames 기반으로 B2B / 해외법인 분리 집계
      const shipResult1 = processShipmentData(ship.rows,    '판매가액계',      overseasNames)
      const shipResult2 = processShipmentData(expShip.rows, '원화판매금액계',  overseasNames)
      const shipmentTotal     = shipResult1.total + shipResult2.total
      const shipB2BTotal      = shipResult1.b2bTotal      + shipResult2.b2bTotal       // 해외법인 제외
      const shipOverseasTotal = shipResult1.overseasTotal + shipResult2.overseasTotal   // 해외법인만

      // ── 주차별 집계 (Menu 3 전주/금주) ─────────────────────
      // 1차: 각 시트 독립 집계 (weekStart 자동 감지)
      const weekly1 = processShipmentWeekly(ship.rows,    '판매가액계',     overseasNames)
      const weekly2raw = processShipmentWeekly(expShip.rows, '원화판매금액계', overseasNames)
      // 더 나중 weekStart를 두 시트의 공통 기준으로 채택
      const weekStart = weekly1.weekStart && weekly2raw.weekStart
        ? (weekly1.weekStart >= weekly2raw.weekStart ? weekly1.weekStart : weekly2raw.weekStart)
        : (weekly1.weekStart || weekly2raw.weekStart || null)
      // 2차: 공통 weekStart로 재집계 (두 시트가 같은 주차 기준을 공유하도록)
      const weekly2 = weekStart !== weekly2raw.weekStart && weekly2raw.weekStart
        ? processShipmentWeekly(expShip.rows, '원화판매금액계', overseasNames, weekStart)
        : weekly2raw
      const _weekly1final = weekStart !== weekly1.weekStart && weekly1.weekStart
        ? processShipmentWeekly(ship.rows, '판매가액계', overseasNames, weekStart)
        : weekly1

      // 거래처별 전주/금주 합산 (두 시트 병합)
      function mergeWeeklyCustomers(a, b) {
        const merged = {}
        for (const [cust, v] of Object.entries(a || {}))
          merged[cust] = { prev: v.prev, curr: v.curr }
        for (const [cust, { prev, curr }] of Object.entries(b || {})) {
          if (merged[cust]) { merged[cust].prev += prev; merged[cust].curr += curr }
          else merged[cust] = { prev, curr }
        }
        return merged
      }
      const weeklyByCustomer = mergeWeeklyCustomers(
        _weekly1final.byCustomer,
        weekly2.byCustomer
      )

      // ── 당월 결정: 납기일 기반 ────────────────────────────
      const detectedYM = shipResult1.currentYM || shipResult2.currentYM

      let currentYear, currentMonth, prevYear, prevMonth

      if (detectedYM) {
        currentYear  = parseInt(detectedYM.substring(0, 4))
        currentMonth = parseInt(detectedYM.substring(5, 7))
        const prev   = prevYearMonth(detectedYM)
        prevYear     = prev.year
        prevMonth    = prev.month
      } else {
        warnings.push('출하의뢰 납기일을 감지하지 못해 시스템 날짜를 사용합니다.')
        const ctx    = getDateContext()
        currentYear  = ctx.currentYear
        currentMonth = ctx.currentMonth
        prevYear     = ctx.prevYear
        prevMonth    = ctx.prevMonth
      }

      // ── B2C 파싱 (currentYear 확정 후) ───────────────────
      const b2cData = processB2CData(b2cRaw.text || '', currentYear)

      setState({
        loading: false,
        error: null,
        lastUpdated: new Date(),
        b2bRecords,
        targetMap,
        targetB2B,
        targetOverseas,
        targetByCustomer,
        overseasNames,
        overseasMap,
        estByCustomer,
        customerCountry,
        b2cData,
        estTotal: totalEst,
        shipmentTotal,
        shipB2BTotal,
        shipOverseasTotal,
        weeklyByCustomer,
        weekStart,
        currentYear,
        currentMonth,
        prevYear,
        prevMonth,
        detectedYM,
        warnings,
      })
    } catch (e) {
      setState(s => ({ ...s, loading: false, error: e.message }))
    }
  }, [])

  useEffect(() => {
    load()
    const timer = setInterval(load, REFRESH_MS)
    return () => clearInterval(timer)
  }, [load])

  return { ...state, refresh: load }
}
