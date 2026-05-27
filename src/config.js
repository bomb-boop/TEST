// ============================================================
//  구글 시트 설정
//  시트를 "링크가 있는 모든 사용자 - 뷰어" 공유 후 사용하세요
// ============================================================

export const SPREADSHEET_ID = '1rTFpGZr3gpBZdhga74x4Ik_hzu8jSCBQTmda8R0MZbs'

// 각 시트의 정확한 이름 (탭 이름과 동일하게)
export const SHEETS = {
  B2B_CLOSED:    'B2B 매출 마감 현황',
  TARGET_2026:   '2026년 매출 목표',
  MONTHLY_EST:   '당월 예상매출',
  SHIPMENT:      '출하의뢰조회',
  EXPORT_SHIP:   '수출출하의뢰조회',
  B2C:           'B2C',
}

// CSV export URL builder
export function csvUrl(sheetName) {
  const encoded = encodeURIComponent(sheetName)
  return `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encoded}`
}

// ============================================================
//  'B2B 매출 마감 현황' 시트 컬럼 키워드 자동 감지 설정
//  시트의 실제 헤더명에 아래 키워드가 포함되어 있으면 자동 인식합니다
// ============================================================
export const COL_KEYWORDS = {
  year:      ['년도', '연도', 'year', 'Year'],
  month:     ['월', 'month', 'Month'],
  customer:  ['거래처', '고객사', '업체명'],
  person:    ['담당자', '담당'],
  item:      ['품번', '품목', '제품번호'],
  krwAmount: ['원화판매금액', '원화금액', '판매금액(원)'],
  country:   ['메인유통국가', '국가', '유통국가'],
  // 당월 예상매출 시트
  estAmount: ['예상매출', '예상금액', '예상판매'],
  // 출하의뢰 시트 - 원화 금액
  shipKrw:   ['원화금액', '원화판매금액', '출하금액', '판매금액'],
}

// 데이터 헤더 행 번호 (0-indexed). 0 = 첫 번째 행이 헤더
export const HEADER_ROW = 0
