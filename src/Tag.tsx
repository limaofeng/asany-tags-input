import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';

import classnames from 'classnames';

import TagEditing from './TagEditing';
import type { TagData, TagEditingProps, TagEditingRef, ValidatorFunc } from './typings';

type TagProps = {
  data: TagData;
  editing: boolean;
  validate: ValidatorFunc;
  selected: boolean;
  onClick: (data: TagData) => void;
  onDoubleClick: (data: TagData) => void;
  onEnter: () => void;
  onDelete: () => void;
} & TagEditingProps;

function ArrowIcon() {
  return (
    <span className="svg-icon">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12.6343 12.5657L8.45001 16.75C8.0358 17.1642 8.0358 17.8358 8.45001 18.25C8.86423 18.6642 9.5358 18.6642 9.95001 18.25L15.4929 12.7071C15.8834 12.3166 15.8834 11.6834 15.4929 11.2929L9.95001 5.75C9.5358 5.33579 8.86423 5.33579 8.45001 5.75C8.0358 6.16421 8.0358 6.83579 8.45001 7.25L12.6343 11.4343C12.9467 11.7467 12.9467 12.2533 12.6343 12.5657Z"
          fill="black"
        ></path>
      </svg>
    </span>
  );
}

function Tag(props: TagProps, ref: React.ForwardedRef<TagEditingRef | null>) {
  const { data, onChange, selected, validate, onClick, onPrev, onNext, onEnter, onDelete, onDoubleClick, editing } =
    props;
  const input = useRef<TagEditingRef | any>(null);

  const { invalid = !validate(data.content) } = data;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onClick(data);
    },
    [data, onClick]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onDoubleClick(data);
    },
    [data, onDoubleClick]
  );

  const handleChange = useCallback(
    (name: string) => {
      onChange(name);
    },
    [onChange]
  );

  const value = useMemo(() => data.content, [data]);

  useEffect(() => {
    if (!editing) {
      return;
    }
    input.current?.focus();
    process.nextTick(() => {
      input.current?.select();
    });
  }, [editing]);

  useImperativeHandle(ref, () => ({
    focus() {
      // console.log('---===--- 1', input.current);
      input.current!.focus();
    },
    select() {},
    setValue() {
      // console.log(v);
    },
  }));

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // console.log('handleKeyDown', e.key);
      if (e.key === 'ArrowLeft') {
        onPrev();
        e.preventDefault();
        e.stopPropagation();
      } else if (e.key === 'ArrowRight') {
        onNext();
        e.preventDefault();
        e.stopPropagation();
      } else if (e.key === 'Backspace') {
        onDelete();
        e.preventDefault();
        e.stopPropagation();
      } else if (e.key === 'Enter') {
        onEnter();
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [onDelete, onEnter, onNext, onPrev]
  );

  if (editing) {
    return (
      <TagEditing
        ref={input}
        value={value}
        index={props.index}
        locationTo={props.locationTo}
        onChange={handleChange}
        onDelete={onDelete}
        onPrev={props.onPrev}
        onNext={props.onNext}
      />
    );
  }

  return (
    <span
      tabIndex={-1}
      ref={input}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      className={classnames('asany-tag', { selected, invalid })}
    >
      <span className="token-content">{data.name || data.content}</span>
      <ArrowIcon />
    </span>
  );
}

export default React.forwardRef(Tag);
