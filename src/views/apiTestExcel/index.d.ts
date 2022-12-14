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
export declare type ApiTestRequestDataFormat = {
  path: string;
  rowId: string;
  row: number;
  valuePath: string;
  type: 'request' | 'response' | 'now';
  listSearch?: string;
  prefix?: string;
  suffix?: string;
};
export declare type ApiTestHeaders = {};
