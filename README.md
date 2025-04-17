# DocuFlow - MCP (Model Context Protocol) 프로젝트

DocuFlow는 다양한 문서 형식(.docx, .pdf, .xlsx)을 처리하고 Model Context Protocol을 활용하는 TypeScript 기반 문서 처리 서버입니다.

## 💡 주요 기능

- **다양한 문서 형식 지원**
  - Microsoft Word (.docx) 문서 처리
  - PDF 문서 분석 및 텍스트 추출
  - Excel (.xlsx) 파일 데이터 처리
- **Model Context Protocol SDK 통합**
  - 문서 컨텍스트 관리
  - 효율적인 데이터 처리 파이프라인
- **TypeScript 기반 개발**
  - 타입 안정성 보장
  - 최신 ECMAScript 기능 지원

## 🚀 시작하기

### 필수 요구사항

- Node.js 16.0.0 이상
- npm 또는 yarn 패키지 매니저
- TypeScript 4.0.0 이상

### 설치 방법

1. 저장소 클론:
```bash
git clone https://github.com/seungmin988/DocuFlow-MCP.git
cd DocuFlow-MCP
```

2. 의존성 설치:
```bash
npm install
# 또는
yarn install
```

### 환경 설정

1. 프로젝트 빌드:
```bash
npm run build
# 또는
yarn build
```

2. 개발 모드로 실행:
```bash
npm run dev
# 또는
yarn dev
```

## 📖 사용 방법

### 문서 처리 예시

```typescript
// Word 문서 처리
import { processDocx } from './processors/docx';
const docxResult = await processDocx('example.docx');

// PDF 처리
import { processPdf } from './processors/pdf';
const pdfResult = await processPdf('example.pdf');

// Excel 처리
import { processXlsx } from './processors/xlsx';
const xlsxResult = await processXlsx('example.xlsx');
```

## 🛠 기술 스택

- **TypeScript**: 정적 타입 지원을 통한 안정적인 개발
- **Node.js**: 서버 사이드 런타임 환경
- **Model Context Protocol SDK**: 문서 컨텍스트 관리
- **주요 라이브러리**:
  - `fs-extra`: 향상된 파일 시스템 작업
  - `mammoth`: .docx 파일 처리
  - `pdf-parse`: PDF 파일 처리
  - `xlsx`: Excel 파일 처리
  - `zod`: 데이터 유효성 검증

## 🤝 기여하기

프로젝트 기여는 언제나 환영합니다! 다음과 같은 방법으로 기여하실 수 있습니다:

1. 이슈 제기
2. 기능 제안
3. Pull Request 제출

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 연락처

프로젝트에 대한 문의사항이 있으시다면 이슈를 생성해 주시거나 다음 연락처로 문의해 주세요:
- GitHub: [@seungmin988](https://github.com/seungmin988) 