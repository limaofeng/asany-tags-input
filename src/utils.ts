import type { EmailTagData, ParseTagData, ParseTagFunc, ValidatorFunc } from './typings';

export const sleep = (time: number) =>
  new Promise<number>((resolve) => {
    setTimeout(() => {
      resolve(0);
    }, time);
  });

export function uuid() {
  const s: string[] = [];
  const hexDigits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = '4';
  s[19] = hexDigits.substr(((s[19] as any) & 0x3) | 0x8, 1);
  s[8] = s[13] = s[18] = s[23] = '-';
  return s.join('');
}

export const defaultValidate: ValidatorFunc = (text: string) => {
  return !!text;
};

export const defaultParseTag: ParseTagFunc = (text: string) => {
  return {
    name: text,
  };
};

const EMAIL = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;

const HAS_DETAILS = /([\S]+)<([^<>]+)>$/;

const emailChecker = (text: string) => {
  return EMAIL.test(text);
};

export const emailValidator: ValidatorFunc = (text: string) => {
  const emial = parseEmailTag(text);
  return !!emial.address && emailChecker(emial.address);
};

export const parseEmailTag: ParseTagFunc<EmailTagData> = (text: string) => {
  if (HAS_DETAILS.test(text)) {
    const emailExpArray = HAS_DETAILS.exec(text)!;
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
