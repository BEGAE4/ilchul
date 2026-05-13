# 프로젝트 구조

---

Vite create project를 활용한 가장 기본적인 프로젝트 구조를 활용합니다

해당 프로젝트를 수행하며 얼마든지 다른 프로젝트 아키텍쳐로 변경될 수 있습니다.

```jsx

├── public
└── src
    ├── api
    │   └── types
    ├── assets
    ├── components
    │   └── header
    ├── hooks
    ├── pages
    ├── stores
    └── utils
```

- api
    - 백엔드 서버 등의 api 통신을 위한 폴더
        - types
            - 통신을 위한 타입을 선언합니다.
- assets
    - 정적인 이미지, 폰트 등을 포함하는 폴더
    - images/fonts 등으로 세분화
- components
    - 컴포넌트를 포함하는 폴더
    - 각 기능에 따라 폴더를 세분화 합니다.
    - 폴더 내부에는 `component.tsx` 와 customHooks가 포함될 수 있습니다.
- hooks
    - 공통적으로 사용하는 재사용 가능한 `customHooks`를 포함합니다.
- pages
    - router 내에서 동작하는 page를 포함합니다.
- utils
    - 유틸 합수를 포함합니다.

이후 숙달된다면 FSD/Atomic패턴 등을 적용시킬 수 있습니다.

### FSD (Feature-Sliced Design)

```jsx
├── public/
└── src/
    ├── app/
    ├── progresses/
    ├── pages/
    ├── widgets/
    ├── features/
    ├── entities/
    └── shared/
```

참고

- https://seo-tory.tistory.com/91
- https://feature-sliced.design/kr/docs/get-started/tutorial

# Skills

---

- JS(ES6)

### Library

- ReactJS
    - 넓은 생태계와 다양한 확장 라이브러리를 갖고 있습니다
    - CustomHook을 활용하여 가독성 및 책임의 분리에 유리합니다.
    - 학습 시, 난이도가 비교적 높습니다.

### Style

- **scss**
    - 요소간의 관계를 명확하게 나타낼 수 있습니다.
    - 관계가 복잡해질 수록 가독성이 떨어지고, 추적이 어렵습니다.
    - CSS보다 심플한 표기법으로 CSS를 구조화하여 표현할 수 있다
    - 스킬 레벨이 다른 팀원들과의 작업 시 발생할 수 있는 구문의 수준 차이를 평준화할 수 있다
    - **CSS에는 존재하지 않는 Mixin 등의 강력한 기능을 활용하여 CSS 유지보수 편의성을 큰 폭으로 향상시킬 수 있다**
- styled-components
    - 스타일 요소들을 태그로 선언해 가독성에 유리합니다
    - 의미있는 태그를 만듦에 있어서 고민해보아야할 부분들이 있으며, 약간의 변경을 위해 새로운 태그를 만들어야 할 수도 있는 것이 단점입니다.
- Tailwind
    - 생산성이 높습니다. 추가적인 CSS없이 간단하게 반응형 스타일링을 구현할 수 있습니다.
    - 모든 스타일 속성이 class의 속성으로 포함되므로, **이 과정에서 JSX의 가독성이 떨어질 수 있습니다.**

**B102** 팀은 **scss**를 사용합니다.

### 상태관리

- Redux / Redux-tookit
    - 디버깅 시, 상태 추적에 유리합니다.
    - 한 기능 추가에 많은 보일러플레이트의 작성이 요구됩니다.
- Zustand
    - 용량이 작고, 작성해야 하는 코드의 양이 많지 않습니다.
    - 상태 추적이 쉽지 않습니다.

참고: https://yong-nyong.tistory.com/94

**B102** 팀은 **Zustand**를 사용합니다.

### ETC

- TypeScript
    - props나 API의 부정확한 타입으로 인한 런타입 에러를 방지할 수 있습니다.
    - VScode에서 선언한 객체에 대해 자동완성을 제공하는 것이 소소한 장점입니다.
    - JS만을 사용하는 것에 비해 타입을 지정하는 과정에서 생산성이 떨어질 수 있습니다.
- Axios
    - 여러 경우에 대한 client와 interceptor를 활용해 공통된 작업을 처리할 수 있습니다.
    - get, post 등 다양한 메소드를 지원합니다.
    - 브라우저 환경 이외에도 다양한 환경에서의 통신을 지원합니다.

# Naming

---

네이밍 컨벤션은 기본적으로 [AirBnb Style Guide를](https://github.com/tipjs/javascript-style-guide?tab=readme-ov-file) 참조합니다. 추가적인 정보를 확인하려면 레포 내에서 참조 가능합니다.

### Static한 값

`SNAKE_CASE`를 사용합니다.

`const CONSTANT_NUM = 1;`

### 참조값

`camelCase`를 사용합니다.
`const`를 지향해주세요. `var` 는 사용하지 않습니다.
`const variableNum = 1;`

### 함수

`camelCase`를 사용합니다.
`const getFunction = () => {}`

함수 선언은 **호이스팅** 시 전체가 참조될 수 있도록 표현식 보다 **선언문**을 사용해 주세요. 

```jsx
// bad
const foo = function () {
};

foo

const foo = () => {
}

// good
function foo() {
}
```

<aside>
💡

### 화살표 함수를 써야 되는 경우

자동 바인딩 함수이므로 this의 영향 범위를 상위 객체로 전달하고 싶은 경우에만 사용한다.

[this에 대해 공부하기](https://poiemaweb.com/js-this)

</aside>

### 컴포넌트

`PascalCase`를 사용합니다.

컴포넌트 선언시에는 ArrowFunction(여기는 알아서 바꾸쇼)로 선언해주세요.
`const CommonComponent = () => {}`

### Type

TS를 활용한다면 확장에 유리한 interface 키워드를 활용한 타입 선언을 권장합니다.

```jsx
interface BaseProps {
  id: string;
}

interface ButtonProps extends BaseProps {
  onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({ id, onClick }) => (
  <button id={id} onClick={onClick}>Click me</button>
);
```

# Api 핸들링

---

Api는 기본적으로 Api 폴더 내에 각 도메인명으로 파일을 생성합니다.

<aside>
💡

`user`의 데이터를 활용하는 api라면 user.ts

</aside>

이후 axios를 활용하여 데이터를 받아오며, 에러 핸들링은 이 시점에서 try, catch를 활용합니다.

반환값은 경우에 따라 다르지만, 특별한 경우가 아니라면 response가 아닌 response.data를 반환해주세요.

### TypeScript의 경우

TypeScript를 사용하는 경우 해당 작업 이전에 타입을 지정합니다.

타입 지정은 api/types에서 `DOMAIN.ts` 로 타입을 지정하며, type이 아닌 interface로 선언해주세요.

### React-Query의 경우

> 사용한다면 추가 작성 필
> 

# CSS Naming

---

BEM 기법을 활용합니다.

> BEM이란? HTML 구조를 **Block**, **Element**, **Modifier**라는 세 가지 주요 구성요소로 나누는 네이밍 기법
> 

**1. Block**

•	독립적인 단위 또는 컴포넌트를 나타냅니다.

•	의미를 갖는 이름을 사용하며, 다른 컴포넌트와 겹치지 않도록 명확하게 작성.

•	예: button, card, header.

**2. Element**

•	블록 내부의 구성요소를 나타냅니다.

•	블록과 연결된 하위 요소로서 존재하며, 블록 없이는 독립적으로 존재하지 않습니다.

•	클래스 이름은 `__` (언더스코어 두 개)로 구분합니다.

•	예: `button__icon`, `card__title`.

**3. Modifier**

•	블록이나 엘리먼트의 **상태나 변형**을 나타냅니다.

•	클래스 이름은 `--` (하이픈 두 개)로 구분합니다.

•	예: `button--disabled`, `card__title--large`.

다음 예시를 기반으로 작성합니다

`block__element--modifier` 

```jsx
<div class="card">
  <h2 class="card__title">Card Title</h2>
  <p class="card__description">Card description here.</p>
  <button class="card__button card__button--primary">Click me</button>
</div>
```

<aside>
💡

주의사항!
BEM 네이밍을 활용하면 요소들의 이름으로 역할을 구분지을 수 있기 때문에 유리한 점이 있지만, depth가 너무 깊어질 경우, 오히려 가독성을 해칠 수 있기 때문에 가급적 1 ~ 2 depth까지만 활용할 수 있도록 합시다.

</aside>