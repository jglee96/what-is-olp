# Robot OLP Simulator

로봇 오프라인 프로그래밍(OLP) 프론트엔드 직무가 실제로 어떤 일을 하는지 파악하기 위해 만든 학습용 시뮬레이터입니다.

## 만든 이유

로봇 OLP 엔지니어링 프론트엔드 직무에 지원했는데, 직무 설명만으로는 실제로 무엇을 개발하는지 감이 잘 오지 않았습니다. OLP 소프트웨어(RoboDK, ABB RobotStudio 등)를 찾아보며 핵심 기능을 직접 구현해보면서 이 직무의 기술 스택과 도메인 지식을 익히고자 이 프로젝트를 시작했습니다.

## OLP(Offline Programming)란?

로봇을 실제 생산 라인에서 멈추지 않고, **가상 환경에서 미리 경로를 프로그래밍**하는 기술입니다. 시뮬레이션으로 검증한 뒤 실제 로봇에 코드를 업로드하는 방식으로 다운타임을 최소화합니다.

OLP 프론트엔드 엔지니어는 이 과정을 지원하는 **3D 시각화, 경로 계획, 코드 생성 UI**를 개발합니다.

## 기능

### 관절 제어
- 6-DOF 산업용 로봇 암의 각 관절(J1~J6)을 슬라이더로 실시간 조작
- 관절 한계(Limit) 범위 내에서만 동작
- TCP(Tool Center Point) 위치를 Forward Kinematics로 실시간 계산 및 표시

### 프로그램 편집
- 원하는 포즈에서 웨이포인트(Waypoint) 등록
- 등록된 경로를 순서대로 자동 재생
- ABB RAPID 문법으로 로봇 프로그램 코드 자동 생성 (`MoveJ` 명령)

### I/O 모니터링
- 디지털 입력(안전문, 비상정지, 파트 감지 등) 상태 모니터링
- 디지털 출력(그리퍼, 진공, LED 등) 수동 토글
- 로봇 동작 모드 및 에러 상태 표시

### 3D 뷰포트
- Three.js 기반 실시간 3D 렌더링
- 마우스 드래그로 시점 회전, 스크롤로 줌
- 작업 반경(Workspace) 시각화 토글
- XYZ 축 기즈모 표시

## 기술 스택

| 분류 | 사용 기술 |
|---|---|
| 프레임워크 | React 19, Vite |
| 3D 렌더링 | Three.js, @react-three/fiber, @react-three/drei |
| 상태 관리 | Zustand |
| 언어 | JavaScript (JSX) |

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:5173 접속

## 사용법

1. **관절 제어** 탭에서 슬라이더를 움직여 로봇 포즈 설정
2. **"+ 경로 추가"** 버튼으로 현재 포즈를 웨이포인트로 저장
3. 다른 포즈로 이동 후 반복하여 경로 구성
4. **프로그램** 탭에서 **"▶ 실행"**으로 전체 경로 재생
5. 상단 **"작업 반경"** 버튼으로 로봇 도달 가능 범위 확인

## 프로젝트 구조

```
src/
├── components/
│   ├── Scene3D.jsx      # Three.js Canvas 및 조명/카메라 설정
│   ├── RobotArm.jsx     # 6-DOF 로봇 암 3D 모델 및 FK 계산
│   ├── JointPanel.jsx   # 관절 제어 슬라이더 패널
│   ├── ProgramPanel.jsx # 웨이포인트 목록 및 경로 재생
│   └── IOPanel.jsx      # 디지털 I/O 모니터링 패널
├── store/
│   └── robotStore.js    # Zustand 전역 상태 (관절값, 웨이포인트, 재생)
├── App.jsx              # 레이아웃 및 탭 구성
└── main.jsx
```

## 참고한 실제 OLP 소프트웨어

- ABB RobotStudio
- KUKA.Sim
- RoboDK
- Fanuc ROBOGUIDE
