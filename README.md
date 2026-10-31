# SAEV AI Digital Twin — 공개 Replay 스타터

**현재 공개 사이트는 실제 v2D-1 결과를 재생하는 정적 관제판입니다. 웹에서 새 사고를 실행하는 기능은 아직 없습니다.**

- 배포 URL: https://ozymandiaz421.github.io/saev-ai-digital-twin-web/
- 실험 데이터: 1,574대 차량, 시뮬레이션 T+19~34분, 실제 `gpt-5.6` 진단 및 선택된 `OPT_B` 대응
- 실제 계산된 분기: **기존 정책 유지** 및 **OPT_B**. `OPT_A`, `OPT_C`는 설명만 있고 미래 결과는 아직 없음.
- 지도 배경: **좌표 기반 개략 지도**. 실제 인천 도로 타일을 아직 연결하지 않았음.
- 원본 관측: 실제 GPS가 아닌 엔진의 확정 이벤트 기반 위치 추정. 현재 시점 뒤의 미래 결과를 운영 관측인 것처럼 표시하면 안 됨.
- API 키, Ground Truth, 전체 Snapshot, 미래 요청 목록은 **포함하지 않음**.

## 배포
GitHub 저장소 `ozymandiaz421/saev-ai-digital-twin-web`에 이 폴더의 **내용물 전체를 루트**로 업로드하세요.
Settings → Pages → Source: GitHub Actions 를 선택한 상태에서 `main`에 Push하면 Actions가 검사 후 배포합니다.
`index.html`은 단독으로 열려도 동작하며, Node.js·Colab·GCP가 필요하지 않습니다.

## 검사
`python tests/test_public_replay.py`

## 다음 개발자에게
- 이 HTML은 이미 작동하는 기존 와이어프레임의 배포 버전입니다. 재생 동작을 깨뜨리지 마세요.
- `replay/v2d1_opt_b_public.json`은 React/TypeScript와 MapLibre로 이식할 때 재활용하는 데이터 계약 초안입니다.
- 웹의 '사고 주입'을 실제 실행인 것처럼 바꾸지 마세요. 백엔드 완성 전에는 replay/demo로 명시합니다.
- 인터랙티브 백엔드가 붙으면 GPT 호출은 브라우저가 아닌 Python 서버에서 합니다.
- 추후 React/Vite 이식 시 `base: '/saev-ai-digital-twin-web/'` 설정 및 GitHub Actions 빌드를 사용합니다.
