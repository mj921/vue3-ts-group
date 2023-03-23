export const getId = () =>
  `${Date.now()}_${Math.random()
    .toString()
    .substring(2, Math.floor(Math.random() * 6) + 3)}`;

export const addZero = (num: number, len = 2) => {
  return (Array(2).fill(0).join('') + num).slice(-len);
};

export const dateFmt = (
  fmt = 'yyyy-MM-dd',
  date: Date | string | number = new Date()
) => {
  const originVal = date;
  if (typeof date === 'string' && /^\d+$/.test(date)) {
    date = +date;
  }
  if (typeof date === 'number' && date <= 9999999999) {
    date *= 1000;
  }
  date = new Date(date);
  if (date.toString() === 'Invalid Date') {
    return originVal.toString();
  }
  const y = date.getFullYear();
  const M = date.getMonth() + 1;
  const d = date.getDate();
  const h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();
  const S = date.getMilliseconds();
  const w = date.getDay();
  const weeks = ['日', '一', '二', '三', '四', '五', '六'];
  const map = {
    yyyy: y,
    yy: y.toString().slice(2),
    MM: addZero(M),
    M,
    dd: addZero(d),
    d,
    hh: addZero(h),
    h,
    HH: addZero(h % 12),
    H: h % 12,
    mm: addZero(m),
    m,
    ss: addZero(s),
    s,
    S,
    w: `星期${weeks[w]}`,
  };
  const reg = new RegExp(`(${Object.keys(map).join('|')})`, 'g');
  return fmt.replace(reg, (match: string, $: keyof typeof map) =>
    map[$].toString()
  );
};

export const pyDateFmt = (
  fmt = '%Y-%m-%d',
  date: Date | string | number = new Date()
) => {
  const originVal = date;
  if (typeof date === 'string' && /^\d+$/.test(date)) {
    date = +date;
  }
  if (typeof date === 'number' && date <= 9999999999) {
    date *= 1000;
  }
  date = new Date(date);
  if (date.toString() === 'Invalid Date') {
    return originVal.toString();
  }
  const y = date.getFullYear();
  const M = date.getMonth() + 1;
  const d = date.getDate();
  const h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();
  const S = date.getMilliseconds();
  const w = date.getDay();
  const weeks = ['日', '一', '二', '三', '四', '五', '六'];
  const map = {
    '%Y': y,
    '%y': y.toString().slice(2),
    '%m': addZero(M),
    M,
    '%d': addZero(d),
    d,
    '%H': addZero(h),
    h,
    '%I': addZero(h % 12),
    H: h % 12,
    '%M': addZero(m),
    m,
    '%S': addZero(s),
    s,
    S,
    '%w': `星期${weeks[w]}`,
  };
  const reg = new RegExp(`(${Object.keys(map).join('|')})`, 'g');
  return fmt.replace(reg, (match: string, $: keyof typeof map) =>
    map[$].toString()
  );
};

export const hexColorToRgb = (color: string) => {
  if (/^#?([\da-fA-F]{3}){1,2}$/.test(color)) {
    if (color[0] === '#') {
      color = color.substring(1);
    }
    if (color.length === 3) {
      color = color
        .split('')
        .map((el) => el + el)
        .join('');
    }
    return {
      r: parseInt(color.substring(0, 2), 16),
      g: parseInt(color.substring(2, 4), 16),
      b: parseInt(color.substring(4, 6), 16),
    };
  } else {
    return {
      r: 0,
      g: 0,
      b: 0,
    };
  }
};

export const generateUuid = () =>
  'xxxxxxxx-xxxx-xxxx-xxxx-xxxxx'.replace(/x/g, () =>
    ((Math.random() * 16) | 0).toString(16)
  ) + Date.now().toString(16);

export const getValueByPath = (
  obj: { [key: string]: any } | Array<any>,
  path = '',
  shengyu = 0
) => {
  let value = obj;
  const pathList = path.split('.');
  while (typeof value === 'object' && value && pathList.length > shengyu) {
    const key = pathList.shift() || '';
    if (Array.isArray(value)) {
      if (value.length <= +key) return null;
      value = value[+key];
    } else {
      if (!(key in value)) return null;
      value = value[key];
    }
  }
  return value;
};
