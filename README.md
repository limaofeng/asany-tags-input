# TagsInput

使用 React 实现的 标签输入组件

## Install

```bash
npm i @asany/tags-input # or yarn add @asany/tags-input
```

## Usage

```tsx
const Example = () => {
  const handleChange = (...args) => {
    console.log(args);
  };
  return <TagsInput onChange={handleChange} placeholder="输入标签..." />;
};
```

## Maintainers

[@limaofeng](https://github.com/limaofeng).

## License

[MIT](LICENSE) © 李茂峰
