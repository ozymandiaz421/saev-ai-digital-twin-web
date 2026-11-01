# Codex 다음 작업 지시 — SAEV 디지털 트윈

## 준비 완료
- 공개 GitHub: https://github.com/ozymandiaz421/saev-ai-digital-twin-web
- 비공개 GitHub: https://github.com/ozymandiaz421/saev-ai-digital-twin
- GCP Project ID: `saev-ai-digital-twin-2026`
- GitHub Pages Source: GitHub Actions (사용자 설정 완료)
- 정적 Replay 사이트 및 배포 workflow: `saev-ai-digital-twin-web/`
- 읽기/상태 확인 전용 FastAPI skeleton 및 tests: `saev-ai-digital-twin-private/backend/`

## 반드시 먼저 읽기
`CODEX_HANDOFF_SAEV_AI_DIGITAL_TWIN_A_TO_Z_2026-10-30.md` 및 `v2D1_SAEV_GPT_Diagnosis_Action_Integration.ipynb`.
Private repo에 이전 인수인계 ZIP 전체를 그대로 커밋하지 마세요. 필요한 코드/문서만 분리하고 API 키·
사고 Ground Truth·미래 요청·개인정보·대용량 Snapshot은 공개 repo에 절대 업로드하지 마세요.

## 다음 순서
1. Public repo에 정적 Replay를 배포하고 테스트. 사용자에게 URL로 확인 요청.
2. Live/Replay 구분을 유지한 채 React/TypeScript/MapLibre로 웹 컴포넌트 이식.
   실제 지도 타일/attribution 제공 정책과 성능 확인, 1574대 위치 재생.
3. GPT 진단·세 옵션·선택 대응 차량을 강조. OPT_A/C 미래는 계산된 결과가 없으므로 비활성.
4. Python v2D1 notebook에서 검증된 엔진을 모듈로 분리하고 기존 48개 QA 유지.
5. FastAPI endpoint를 원본 시뮬레이션과 연결. 사고 주입기 내부 정보는 Detector/GPT에게 절대 전달 금지.
6. 사용자 선택 중 가상 시간 일시정지, 승인 시점 Snapshot, 독립 A/B fork, 예상 효과와 계산된 효과 구별.
7. Cloud Run 비용 보호·동시세션 분리·외부 snapshot 저장·Secret Manager 후 배포.

## 하지 말 것
- API가 없는데 버튼을 눌러 실시간 사고 실행했다고 표시하는 일
- A/C의 미계산 미래 경로나 KPI를 꾸며내는 일
- `vehicles.state=IDLE`만으로 실시간 차량 가용성을 판단하는 일
- 미래 요청/예약 결과를 GPT Observation으로 전달하는 일
- 결과 48/48을 장시간 검증 통과라고 해석하는 일
- 비공개 개발 ZIP을 공개 저장소에 통째로 업로드하는 일
