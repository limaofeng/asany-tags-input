import React from 'react';
import { Meta, Story } from '@storybook/react';
import TagsInput from '../src';

const meta: Meta = {
  title: 'Demos/邮箱',
  component: TagsInput,
  argTypes: {
    onChange: { action: 'changed' },
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

const EMAIL = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;

const HAS_DETAILS = /([\S]+)<([^<>]+)>$/;

const emailChecker = (text: string) => {
  return EMAIL.test(text);
};

const emailValidator = (text: string) => {
  const emial = parseEmailTag(text);
  return emial.address && emailChecker(emial.address);
};

const parseEmailTag = (text: string) => {
  if (HAS_DETAILS.test(text)) {
    const emailExpArray = HAS_DETAILS.exec(text);
    return {
      name: emailExpArray[1],
      address: emailExpArray[2],
    };
  } else {
    if (emailChecker(text)) {
      return {
        name: text.substring(0, text.lastIndexOf('@')),
        address: text.trim(),
      };
    }
    return {
      name: text.trim(),
      address: null,
    };
  }
};

const Template: Story<any> = (args) => {
  const handleChange = (args) => {
    console.log(...args);
  };
  return (
    <div>
      <TagsInput
        value={['kaixin@hotmail.com', '汪汪<wangwang@163.com>']}
        onChange={handleChange}
        placeholder="输入邮箱..."
        parseTag={parseEmailTag}
        validate={emailValidator}
      />
    </div>
  );
};

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

Default.storyName = '邮箱';

Default.args = {};
