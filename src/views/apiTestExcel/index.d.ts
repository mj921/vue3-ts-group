export declare type ApiTestExcelPane = {
  name: string;
  dataList: ApiTestExcel[];
}

export declare type ApiTestExcel = {
  _id: string;
  id: number;
  method:
    | 'GET'
    | 'PUT'
    | 'POST'
    | 'DELETE'
    | 'PATCH'
    | 'OPTIONS'
    | 'HEAD'
    | 'CONNECT'
    | 'get'
    | 'put'
    | 'post'
    | 'delete'
    | 'patch'
    | 'options'
    | 'head'
    | 'connect';
  module: string;
  url: string;
  data: string;
  sql: string;
  Expected_code: string;
  Actual_code: string;
  sql_result: 'pass' | 'fail' | '';
  Result: 'pass' | 'fail' | '';
  Reason: string;
  FormData: string;
  RequestDataFormat: string;
  total: 'y' | '';
  delay: number;
  headers: string;
};

export declare type AddApiTestExcel = {
  [key in keyof ApiTestExcel as Exclude<
    key,
    | 'id'
    | 'Actual_code'
    | 'sql_result'
    | 'Result'
    | 'Reason'
    | 'data'
    | 'sql'
    | 'FormData'
    | 'headers'
    | 'RequestDataFormat'
  >]: ApiTestExcel[key];
} & {
  data: string;
  sql: string;
  FormData: string;
  headers: string;
  RequestDataFormat: ApiTestRequestDataFormat[];
};

export declare type ApiTestData = {
  [key: string]: string | number | ApiTestData | ApiTestData[];
};
export declare type ApiTestSql = {
  code: number;
  condition: any[];
  my_sql: string;
  result: string;
  database: string;
  resultType: 'default' | 'interface' | '';
  equalType: 'condition' | '';
};
export declare type ApiTestRequestDataFormatNow = {
  path: string;
  type: 'now';
  prefix?: string;
  suffix?: string;
}
export declare type ApiTestRequestDataFormatRequest = {
  path: string;
  rowId: string;
  row: number;
  valuePath: string;
  type: 'request' | 'response';
  listSearch?: string[];
}
export declare type ApiTestRequestDataFormat = ApiTestRequestDataFormatNow | ApiTestRequestDataFormatRequest;
export declare type AddApiTestRequestDataFormat = {
  [key in keyof ApiTestRequestDataFormatNow as Exclude<key, 'type'>]: ApiTestRequestDataFormatNow[key];
} & {
  [key in keyof ApiTestRequestDataFormatRequest as Exclude<key, 'type'>]: ApiTestRequestDataFormatRequest[key];
} & {
  type: ApiTestRequestDataFormatNow['type'] | ApiTestRequestDataFormatRequest['type'];
}
export declare type ApiTestHeaders = {};
