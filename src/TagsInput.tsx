import React, { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';

import classnames from 'classnames';
import { useClickAway } from 'react-use';

import { defaultParseTag, defaultValidate, uuid } from './utils';

import type { InnerParseTagFunc, TagData, TagEditingRef, TagsInputProps } from './typings';
import TagEditing from './TagEditing';
import Tag from './Tag';

import { sleep } from './utils';

import './style/index.scss';

type TagsInputState = {
  status: 'input' | 'editing' | 'active';
  selectedKey?: string;
  activeIndex: number;
  tags: (TagData | 'input')[];
};

function initialState(tags: string[], parseTag: InnerParseTagFunc): TagsInputState {
  return {
    selectedKey: undefined,
    activeIndex: -1,
    status: 'input',
    tags: tags
      .map((item) => item.split(';').filter((e) => !!e))
      .reduce((arr, item) => {
        arr.push(...item);
        return arr;
      }, [])
      .map(parseTag),
  };
}

function TagsInput(props: TagsInputProps) {
  const { className, placeholder, validate = defaultValidate } = props;

  const container = useRef<HTMLDivElement>(null);
  const input = useRef<TagEditingRef>(null);

  const temp = useRef({ onChange: props.onChange, value: props.value, intact: '' });

  temp.current.onChange = props.onChange;
  temp.current.value = props.value;

  const parseTag = useMemo(
    () =>
      (text: string): TagData => {
        const _parseTag = props.parseTag || defaultParseTag;
        return { ..._parseTag(text), content: text, invalid: !validate(text), id: uuid() };
      },
    [props.parseTag, validate]
  );

  const state = useRef<TagsInputState>(initialState(temp.current.value || [], parseTag));
  const [, forceRender] = useReducer((s) => s + 1, 0);

  const handleClick = useCallback(async (e: React.MouseEvent<HTMLDivElement>) => {
    state.current.selectedKey = undefined;
    let inputIndex = state.current.tags.findIndex((item) => item === 'input');
    if (inputIndex === -1) {
      state.current.tags.push('input');
      forceRender();
      return;
    }

    const element: HTMLDivElement = e.target as HTMLDivElement;
    const rect = element.getBoundingClientRect();

    // console.log('handleClick', e.pageX - rect.x, e.pageY - rect.y, rect, e.pageX, e.pageY);

    const x = e.pageX - rect.x;
    const y = e.pageY - rect.y;

    const starting = { x1: 0, y1: 0 };
    const index = Array.from(container.current!.childNodes)
      .filter((item) => (item as HTMLElement).classList.contains('asany-tag'))
      .findIndex((item: any) => {
        const itemRect: DOMRect = item.getBoundingClientRect();
        const x1 = itemRect.x - rect.x;
        const y1 = itemRect.y - rect.y;

        const x2 = x1 + itemRect.width;
        const y2 = y1 + itemRect.height;

        // console.log({ x, y }, starting);

        if (x1 < starting.x1) {
          if (x > starting.x1 && y > starting.y1) {
            return true;
          }
          starting.x1 = 0;
          starting.y1 = y1;
        }

        if (x > starting.x1 && y > starting.y1 && x < x1 && y < y2) {
          return true;
        }

        starting.x1 = x2;
        starting.y1 = y1;

        return false;
      });

    inputIndex = state.current.tags.findIndex((item) => item === 'input');
    // console.log('inputIndex', inputIndex, 'index', index);

    if (inputIndex !== -1) {
      state.current.tags.splice(inputIndex, 1);
    }

    if (index !== -1) {
      state.current.tags.splice(index, 0, 'input');
    } else {
      state.current.tags.push('input');
    }

    state.current.activeIndex = state.current.tags.findIndex((item) => item === 'input');
    forceRender();
    process.nextTick(async () => {
      while (!input.current) {
        await sleep(60);
      }
      input.current?.focus();
    });
  }, []);

  const removeInput = useCallback(() => {
    state.current.tags = state.current.tags.filter((item) => item !== 'input');
  }, []);

  const handleFocus = useCallback(async () => {
    while (!input.current) {
      await sleep(60);
    }
    process.nextTick(async () => {
      input.current!.focus();
    });
  }, []);

  const handlePrev = useCallback(async () => {
    const { tags, activeIndex } = state.current;

    const prevData = tags[activeIndex];

    if (prevData === 'input') {
      const nextActiveIndex = Math.max(0, activeIndex - 1);
      const data = tags[nextActiveIndex];
      if (data === 'input') {
        if (nextActiveIndex === 0) {
          return;
        }
        throw new Error('未知错误');
      }
      state.current.status = 'active';
      state.current.selectedKey = data.id;
      // console.log('data', data, state.current.selectedKey, state.current.tags);
      state.current.activeIndex = nextActiveIndex;
      removeInput();
      forceRender();
      await handleFocus();
    } else {
      state.current.status = 'input';
      state.current.selectedKey = undefined;
      state.current.tags.splice(activeIndex, 0, 'input');
      state.current.activeIndex = state.current.tags.findIndex((item) => item === 'input');
      forceRender();
      await handleFocus();
    }
  }, [handleFocus, removeInput]);

  const handleNext = useCallback(async () => {
    const { tags, activeIndex } = state.current;

    const prevData = tags[activeIndex];

    if (prevData === 'input') {
      const nextActiveIndex = Math.min(tags.length - 1, activeIndex + 1);
      const data = tags[nextActiveIndex];
      if (data === 'input') {
        if (nextActiveIndex === activeIndex) {
          return;
        }
        throw new Error('未知错误');
      }
      state.current.status = 'active';
      state.current.selectedKey = data.id;
      removeInput();
      state.current.activeIndex = state.current.tags.findIndex((item) => item !== 'input' && item.id === data.id);
      forceRender();
      await handleFocus();
    } else {
      state.current.status = 'input';
      const nextActiveIndex = Math.min(tags.length, activeIndex + 1);
      state.current.selectedKey = undefined;
      state.current.tags.splice(nextActiveIndex, 0, 'input');
      state.current.activeIndex = state.current.tags.findIndex((item) => item === 'input');
      forceRender();
      await handleFocus();
    }
  }, [handleFocus, removeInput]);

  const handleLocationTo = useCallback(
    (index, type = 'input') => {
      if (type === 'input') {
        removeInput();
        state.current.status = 'input';
        state.current.selectedKey = undefined;
        state.current.tags.splice(index, 0, 'input');
        state.current.activeIndex = state.current.tags.findIndex((item) => item === 'input');
        input.current!.setValue('');
        forceRender();
        handleFocus();
      } else {
        state.current.status = 'active';
        state.current.selectedKey = (state.current.tags[index] as TagData).id;
        removeInput();
        state.current.activeIndex = state.current.tags.findIndex(
          (item) => item !== 'input' && item.id === state.current.selectedKey
        );
        forceRender();
        handleFocus();
      }
    },
    [handleFocus, removeInput]
  );

  const execChange = useCallback(() => {
    temp.current.intact = state.current.tags
      .filter((item) => item !== 'input' && !item.invalid)
      .map((item) => (item as TagData).content)
      .join(';');

    const { intact, onChange, value: propsValue } = temp.current;
    if (intact === propsValue?.join(';')) {
      return;
    }
    onChange && onChange(intact.split(';').filter((item) => !!item));
  }, []);

  const handleChange = useCallback(
    (index: number) => (value: string) => {
      // console.log('保存', index, state.current.activeIndex);
      const current = state.current.tags[index];
      const tags = value.split(';').filter((item) => !!item);
      if (!tags.length) {
        return;
      }
      if (current === 'input') {
        state.current.tags.splice(index, 0, ...tags.map(parseTag));
        state.current.status = 'input';
        state.current.activeIndex = state.current.tags.findIndex((item) => item === 'input');
        input.current!.setValue('');
        state.current.tags = [...state.current.tags];
        forceRender();
      } else {
        state.current.tags.splice(
          index,
          1,
          ...tags.map((item, i) => ({ ...parseTag(item), id: i === 0 ? current.id : uuid() }))
        );
        if (tags.length > 1) {
          state.current.status = 'input';
          state.current.selectedKey = undefined;
          state.current.tags.splice(index + tags.length, 0, 'input');
          state.current.activeIndex = state.current.tags.findIndex((item) => item === 'input');
        } else {
          state.current.status = 'active';
        }
        state.current.tags = [...state.current.tags];
        forceRender();
        handleFocus();
      }
      execChange();
    },
    [execChange, handleFocus, parseTag]
  );

  const handleItemClick = useCallback(
    (data: TagData) => {
      // console.log('handleItemClick', data);
      state.current.status = 'active';
      state.current.selectedKey = data.id;
      removeInput();
      state.current.activeIndex = state.current.tags.findIndex(
        (item) => item !== 'input' && item.id === state.current.selectedKey
      );
      forceRender();
    },
    [removeInput]
  );

  const handleDelete = useCallback(async () => {
    const { activeIndex } = state.current;
    state.current.status = 'input';
    state.current.selectedKey = undefined;
    state.current.tags.splice(activeIndex, 1, 'input');
    state.current.tags = [...state.current.tags];
    forceRender();
    execChange();
    while (!input.current) {
      await sleep(60);
    }
    process.nextTick(() => {
      // console.log('.....', state.current.tags, input.current);
      input.current?.focus();
    });
  }, [execChange]);

  const handleEnter = useCallback(() => {
    state.current.status = 'editing';
    removeInput();
    forceRender();
  }, [removeInput]);

  const handleItemDoubleClick = useCallback(() => {
    handleEnter();
  }, [handleEnter]);

  useClickAway(container, () => {
    state.current.selectedKey = undefined;
    forceRender();
  });

  const { tags, selectedKey, status } = state.current;

  useEffect(() => {
    if (!props.value || temp.current.intact === props.value.join(';')) {
      return;
    }
    state.current = initialState(props.value || [], parseTag);
    forceRender();
  }, [execChange, props.value, parseTag]);

  useEffect(() => {
    handleClick({} as any);
  }, [handleClick]);

  return (
    <div ref={container} onClick={handleClick} className={classnames('asany-tags-input', className)}>
      {tags.map((item, index) => {
        if (item === 'input') {
          return (
            <TagEditing
              onPrev={handlePrev}
              onNext={handleNext}
              onDelete={handlePrev}
              ref={input}
              index={index}
              placeholder={placeholder}
              locationTo={handleLocationTo}
              key={item}
              onChange={handleChange(index)}
            />
          );
        } else {
          return (
            <Tag
              ref={item.id === selectedKey ? input : undefined}
              onPrev={handlePrev}
              onNext={handleNext}
              onDelete={handleDelete}
              onEnter={handleEnter}
              data={item}
              index={index}
              validate={validate}
              locationTo={handleLocationTo}
              onChange={handleChange(index)}
              editing={item.id === selectedKey && status === 'editing'}
              onClick={handleItemClick}
              onDoubleClick={handleItemDoubleClick}
              key={item.id}
              selected={item.id === selectedKey}
            />
          );
        }
      })}
    </div>
  );
}

export default TagsInput;
