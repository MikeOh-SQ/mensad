# Mensad Poster Generator

1080 x 1350 크기의 인스타그램 4:5 포스터를 브라우저에서 제작하고 PNG로
다운로드하는 웹 애플리케이션입니다.

## 웹서비스

<https://mikeoh-sq.github.io/mensad/>

## 사용 설명서

### 1. 페이지 유형 선택

- **Title Page**: 로고, 상단 텍스트, 메인 제목, 부제와 명암 스타일을 사용하는
  표지 포스터입니다.
- **Sub Page**: 로고와 제목을 제외하고 배경 이미지와 부제만 사용하는 본문
  포스터입니다. 오버레이와 하단 그라데이션은 적용되지 않습니다.

페이지 유형을 변경해도 Title Page에서 입력한 값은 유지됩니다.

### 2. 배경 이미지와 로고 설정

1. `Background`에서 JPG, PNG 또는 WebP 이미지를 업로드합니다.
2. `Horizontal crop`과 `Vertical crop`으로 포스터에 표시할 위치를 조절합니다.
3. Title Page에서는 SVG 또는 PNG 로고를 업로드할 수 있습니다.
4. 로고를 업로드하지 않으면 기본 Mensa 로고가 표시됩니다.
5. `Clear logo`를 누르면 로고가 숨겨집니다.

### 3. 얼굴 블러

사진을 업로드하면 브라우저가 이미지에서 얼굴을 자동으로 검출합니다.

- 검출된 얼굴은 한 줄에 3개씩 번호와 함께 표시됩니다.
- 얼굴 사진을 클릭하면 해당 얼굴에 블러가 적용됩니다.
- 선택한 얼굴을 다시 클릭하면 블러가 해제됩니다.
- `Add Custom Blur`를 누르면 수동 블러 영역을 추가할 수 있습니다.
- 수동 블러의 `Range`, `X`, `Y` 슬라이더로 크기와 위치를 조절합니다.
- 수동 블러는 여러 개 추가할 수 있으며 `Delete`로 개별 삭제할 수 있습니다.

얼굴 검출과 블러 합성은 사용자 브라우저에서 처리됩니다. 업로드한 사진은 얼굴
검출을 위해 외부 API나 별도 서버로 전송되지 않습니다.

### 4. 텍스트 편집

- Title Page에서는 상단 제목, 상단 부제, 메인 제목 2줄과 부제를 수정할 수
  있습니다.
- Sub Page에서는 부제만 수정할 수 있습니다.
- Subtitle 입력에서 작성한 줄바꿈은 미리보기와 PNG에 그대로 반영됩니다.
- Sub Page의 Subtitle layout에서 Left, Center, Right 정렬을 선택할 수 있습니다.
- 우측 정렬 시 좌우 여백은 각각 92px로 동일하게 적용됩니다.

`Top text layout`, `Main title layout`, `Subtitle layout`, `Style`은 기본적으로
접혀 있습니다. 제목 줄을 클릭하면 글자 크기, 세로 위치 및 스타일 설정이
펼쳐집니다. `Default`는 해당 영역을 초기값으로 되돌립니다.

### 5. PNG 다운로드

`Download PNG`를 누르면 현재 미리보기와 같은 1080 x 1350 PNG 파일이
다운로드됩니다. 웹폰트와 이미지 로딩이 끝난 후 렌더링되므로 버튼 표시가
원래 상태로 돌아올 때까지 기다려 주세요.

## 로컬 실행

### 요구사항

- Node.js 20 권장
- npm

### 실행 및 종료

```bash
./run.sh
```

기본 주소는 `http://localhost:5173`입니다. 같은 네트워크의 다른 PC에서는
실행 시 출력되는 `http://<내부-IP>:5173` 주소로 접속할 수 있습니다.

```bash
./end.sh
```

실행 로그는 `.vite.log`에 저장됩니다. 포트를 변경하려면 다음과 같이 실행합니다.

```bash
PORT=4173 ./run.sh
```

### npm 명령

```bash
npm ci
npm run dev
npm run build
npm run preview
```

## 기술 스택

| 구분 | 기술 | 용도 |
| --- | --- | --- |
| UI | React 18 | 편집 화면과 포스터 컴포넌트 |
| 언어 | TypeScript 5 | 상태 및 컴포넌트 타입 관리 |
| 빌드 | Vite 6 | 개발 서버와 프로덕션 번들 |
| 얼굴 검출 | MediaPipe Tasks Vision | 브라우저 기반 얼굴 영역 검출 |
| 이미지 합성 | Canvas 2D API | 크롭된 배경과 얼굴 블러 합성 |
| PNG 출력 | html-to-image | 1080 x 1350 포스터 다운로드 |
| 한글 폰트 | Pretendard | 포스터 한글 텍스트 |
| 배포 | GitHub Pages, GitHub Actions | `main` 브랜치 자동 배포 |

MediaPipe full-range sparse 모델과 필요한 WASM 런타임은 저장소의
`public/mediapipe`에서 함께 제공됩니다.

## 주요 구조

```text
src/
  components/
    PosterEditor.tsx       입력 상태와 전체 편집 흐름
    PosterCanvas.tsx       1080 x 1350 포스터 렌더링
    FaceBlurControls.tsx   자동 및 수동 얼굴 블러 UI
    ImageUploader.tsx      배경 이미지와 로고 업로드
    TextControls.tsx       텍스트와 레이아웃 설정
  lib/
    faceBlur.ts            얼굴 검출, 썸네일, 블러 합성
    exportImage.ts         PNG 생성 및 다운로드
    posterTemplate.ts      포스터 타입, 기본값, 디자인 토큰
```

## 배포

`main` 브랜치에 변경 사항이 푸시되면
`.github/workflows/deploy-pages.yml`이 다음 작업을 자동으로 수행합니다.

1. 의존성 설치
2. `/mensad/` base 경로로 프로덕션 빌드
3. `dist` 디렉터리를 GitHub Pages에 배포
