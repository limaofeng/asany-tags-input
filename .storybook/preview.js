import { configure } from '@storybook/react';

const loaderFn = () => {
  const allExports = [
    require('../stories/docs/Welcome.stories.mdx'),
    require('../stories/docs/Changelog.stories.mdx'),
    require('../stories/Basic.stories.tsx'),
  ];
  return allExports;
};

configure(loaderFn, module);

// https://storybook.js.org/docs/react/writing-stories/parameters#global-parameters
export const parameters = {
  options: {
    storySort: {
      order: ['综述', ['快速开始', '更新日志'], 'Demos', ['演示', '邮箱']],
    },
  },
  // https://storybook.js.org/docs/react/essentials/actions#automatically-matching-args
  actions: { argTypesRegex: '^on.*' },
};
