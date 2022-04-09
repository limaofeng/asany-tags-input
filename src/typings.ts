export type TagData = {
  id: string;
  name: string;
  content: string;
  invalid?: boolean;
};

export type ParseTagData = {
  name: string;
};

export type ValidatorFunc = (text: string) => boolean;

export type ParseTagFunc = (text: string) => ParseTagData;

export type InnerParseTagFunc = (text: string) => TagData;

export type format = (text: string) => boolean;

export type TagEditingProps = {
  value?: string;
  index: number;
  placeholder?: string;
  locationTo: (index: number, type?: 'input' | 'view') => void;
  onChange: (value: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onDelete: () => void;
};

export type TagEditingRef = {
  focus: () => void;
  select: () => void;
  setValue: (value: string) => void;
};
