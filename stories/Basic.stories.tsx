import React from 'react';
import { Meta, Story } from '@storybook/react';
import TagsInput from '../src';

const meta: Meta = {
  title: 'Demos/基础',
  component: TagsInput,
  argTypes: {
    onChange: { action: 'changed' },
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

const defaultStyle = {
  border: '1px dashed gray',
  padding: '0.5rem 1rem',
  marginBottom: '.5rem',
  marginRight: '.5rem',
  backgroundColor: 'white',
};

const Template: Story<any> = (args) => {
  return <TagsInput placeholder="输入标签..." />;
};

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

Default.storyName = '基础';

Default.args = {};
