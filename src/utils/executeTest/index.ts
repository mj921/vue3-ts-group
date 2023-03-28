import { getValueByPath, pyDateFmt } from '..';
import {
  ApiTestActualDataFormat,
  ApiTestExcelPane,
  ApiTestExcelPaneResult,
  ApiTestExcelResult,
  ApiTestExpectedCodeFormat,
  ApiTestExpectedCodeFormatResult,
  ApiTestGlobalHeaderFormat,
  ApiTestRequestDataFormat,
  ApiTestRequestDataFormatResult,
} from '../../types';
import Logger from './logger';
import request from './request';

type GlobalMap = {
  sheetParam: { [key: string]: { start: number } };
  prevresult: [];
  headers: { [key: string]: string };
};
const getValue = ({
  valueConfig,
  dataRow,
  fromData,
  pathKey = 'path',
  jsonpathKey = 'jsonpath',
}: {
  valueConfig: {
    [key in keyof ApiTestRequestDataFormatResult]?: ApiTestRequestDataFormatResult[key];
  };
  dataRow?: ApiTestExcelResult;
  fromData?: Object;
  pathKey?: 'path' | 'valuePath';
  jsonpathKey?: 'jsonpath' | 'valueJsonpath';
}) => {
  // 如果是 now 类型，则将value设为当前时间戳
  let value: any;
  if (valueConfig.type === 'now') {
    let now = new Date().getTime();
    if (valueConfig.addTime) {
      now += valueConfig.addTime * 1000;
    }
    if (valueConfig.timeFmt) {
      value = pyDateFmt(valueConfig.timeFmt, new Date(now));
    } else {
      value = now.toString();
    }
    // 如果有前缀，则在value前拼上前缀
    if (valueConfig.prefix) {
      value = valueConfig.prefix + value;
    }
    // 如果有后缀，则在value后拼上后缀
    if (valueConfig.suffix) {
      value = valueConfig.prefix + value;
    }
  } else if (valueConfig.type == 'text') {
    value = valueConfig.value || '';
  } else {
    let valueDict = fromData;
    if (!valueDict) {
      // 如果是 response 类型，且依赖的其他接口返回的code不是0，且依赖的接口测试不通过，则跳过这个接口，这个接口直接执行失败
      if (
        valueConfig.type === 'response' &&
        dataRow &&
        dataRow.Actual_code !== 0 &&
        dataRow.Result !== 'pass'
      ) {
        dataRow.Result = 'fail';
        dataRow.Reason = '引用用例执行失败';
        dataRow.interfaceResponse = {};
        return {
          value: null,
          flag: false,
        };
      }
      // 将数据源设置成其他接口的传参
      valueDict = dataRow?.data ?? {};
      // 如果是 response 类型，将数据源改为其他接口的接口返回值
      if (valueConfig.type === 'response') {
        valueDict = dataRow?.interfaceResponse || {};
      }
    }
    // 根据 path 从数据源中取值
    value = getValueByPath(valueDict, valueConfig[pathKey]);
    // 如果需要的值在列表中，则从列表中搜索
    if (valueConfig.listSearch && Array.isArray(value)) {
      for (let item of value) {
        // listSearch 第一个参数为搜索时用到的key，第二个参数为搜索时用到的value，第三个参数为要取的值，
        if (item[valueConfig.listSearch[0]] === valueConfig.listSearch[1]) {
          value = item[valueConfig.listSearch[2]];
          break;
        }
      }
    }
    if (valueConfig.jsonpath) {
      value = getValueByPath(JSON.parse(value), valueConfig[jsonpathKey]);
    }
  }
  return {
    value,
    flag: true,
  };
};

const parseRequestDataFormat = (
  requestDataFormat: ApiTestRequestDataFormatResult[],
  requestData: Object,
  sheetname: string,
  tabList: ApiTestExcelPaneResult[]
) => {
  if (requestDataFormat) {
    requestDataFormat.forEach((rdf) => {
      let dataRow = undefined;
      // 要取接口的下标值为目标接口的id - 1 加上其他已执行sheet的接口的数量
      if (typeof rdf.row !== 'undefined') {
        const tab = tabList.find(
          (el) => el.name === (rdf.sheetName || sheetname)
        );
        if (tab) {
          dataRow = tab.dataList[rdf.row];
        }
      }
      const { value, flag } = getValue({ valueConfig: rdf, dataRow });
      if (!flag) return;
      if (value !== null) {
        // if 'base64' in rdf and rdf['base64'] == 1:
        //   value = base64.encodestring(value)
        // 获取要赋值的上一级
        const tempData = getValueByPath(requestData, rdf.path, 1);
        if (typeof tempData === 'object' && tempData !== null) {
          const pathList = rdf.path.split('.');
          // 如果要赋值的传参在json字符串中，则解析json赋值后再转回json字符串
          if (rdf.jsonpath) {
            // 如果是字典则直接取值转换，如果是列表则转成 int 下标取值转换
            let jsonData = null;
            if (Array.isArray(tempData)) {
              jsonData = JSON.parse(tempData[+pathList[pathList.length - 1]]);
            } else {
              jsonData = JSON.parse(tempData[pathList[pathList.length - 1]]);
            }
            // 获取json内要赋值的上一级 如果这个值是字典或列表，则赋值并转回json字符串
            const tempJsonData = jsonData
              ? getValueByPath(jsonData, rdf.jsonpath, 1)
              : null;
            if (typeof tempJsonData === 'object' && tempJsonData !== null) {
              const jsonPathList = rdf.jsonpath.split('.');
              const tempKey = Array.isArray(tempJsonData)
                ? +jsonPathList[jsonPathList.length - 1]
                : jsonPathList[jsonPathList.length - 1];
              if (rdf.assignType === 'add') {
                tempJsonData[tempKey] += value;
              } else {
                tempJsonData[tempKey] = value;
              }
              if (Array.isArray(tempData)) {
                tempData[+pathList[pathList.length - 1]] =
                  JSON.stringify(jsonData);
              } else {
                tempData[pathList[pathList.length - 1]] =
                  JSON.stringify(jsonData);
              }
            }
          } else {
            const tempKey = Array.isArray(tempData)
              ? +pathList[pathList.length - 1]
              : pathList[pathList.length - 1];
            if (rdf.assignType === 'add') {
              tempData[tempKey] += value;
            } else {
              tempData[tempKey] = value;
            }
          }
        }
      }
    });
  }
};

const sleep = (time: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

export const testInterfaceCase = async (
  dataRow: ApiTestExcelResult,
  tabName: string,
  tabListResult: ApiTestExcelPaneResult[],
  globalMap: GlobalMap
) => {
  const {
    id,
    method,
    module,
    url,
    data,
    sql,
    Expected_code,
    FormData,
    RequestDataFormat,
    ActualDataFormat,
    delay,
    headers,
    globalHeaders,
    zmip,
    ExpectedCodeFormat,
  } = dataRow;
  Logger.info(`正在执行 ${tabName} 第${id}条用例`);
  Logger.info(`请求方式是${method}`);
  Logger.info(`用例模块名称是${module}`);
  Logger.info(`请求地址是${url}`);
  Logger.info(`测试数据是${data}`);
  Logger.info(`FormData是${FormData}`);
  Logger.info(`RequestDataFormat是${JSON.stringify(RequestDataFormat)}`);
  Logger.info(`ActualDataFormat是${ActualDataFormat}`);
  Logger.info(`delay是${delay}`);
  RequestDataFormat &&
    parseRequestDataFormat(RequestDataFormat, data, tabName, tabListResult);
  Logger.info([`接口入参`, data]);
  const _headers: { [key: string]: any } = globalMap.headers || {};
  if (headers) {
    for (let headerKey in headers) {
      _headers[headerKey] = headers[headerKey];
    }
  }
  const result: any = await request(
    url,
    method,
    data,
    _headers,
    FormData === 'y'
  );
  Logger.info(['接口返回数据是', result]);
  if (globalHeaders) {
    globalHeaders.forEach((gh) => {
      // 从响应中取相应的参数
      const value = (getValueByPath(result, gh.path) || '') as string;
      // 如果是 cover 覆盖类型，则直接赋值
      if (gh.type === 'cover') {
        globalMap.headers[gh.key] = value;
      } else if (gh.type === 'add') {
        // 如果是 add 追加类型，则追加
        globalMap.headers[gh.key] += value;
      }
    });
  }
  if (typeof result === 'object' && result) {
    if (ActualDataFormat) {
      dataRow.Actual_code = getValue({
        valueConfig: ActualDataFormat,
        fromData: result,
      }).value;
    } else {
      dataRow.Actual_code = result?.code;
    }
    if (zmip === 'y') {
      dataRow.Reason = result?.errorMsg;
    } else {
      dataRow.Reason = result?.msg;
    }
    dataRow.Expected_code = Expected_code;
    if (ExpectedCodeFormat) {
      dataRow.Expected_code = getValue({
        valueConfig: ExpectedCodeFormat,
        fromData: result,
      }).value;
    }
    if (dataRow.Expected_code === dataRow.Actual_code) {
      dataRow.Result = 'pass';
      Logger.success('用例code比对结果测试通过');
    } else {
      dataRow.Result = 'fail';
      Logger.error(
        `执行用例code比对报错 ${dataRow.Expected_code} != ${dataRow.Actual_code}`
      );
    }
  } else {
    dataRow.Actual_code = '';
    dataRow.Reason = '';
    dataRow.Result = '';
  }
  if (
    delay &&
    (typeof delay !== 'string' || /^\d+$/.test(delay) || delay === 'y')
  ) {
    let sleepTime = 0;
    if (delay === 'y') {
      sleepTime = 2000;
    } else {
      sleepTime = +delay * 1000;
    }
    if (sleepTime > 0) await sleep(sleepTime);
  }
};

const parseResult = (tabList: ApiTestExcelPane[]) => {
  const ip =
    localStorage.getItem('api_test_interface_ip') ??
    'https://front.sit.suosihulian.com/gateway';
  const zmIp =
    localStorage.getItem('api_test_interface_zmip') ?? 'https://pt-qa.lbian.cn';
  return tabList.map((tab) => {
    return {
      name: tab.name,
      dataList: tab.dataList.map((el) => {
        let data = {};
        if (el.data) {
          try {
            data = JSON.parse(el.data);
          } catch (error) {}
        }
        let RequestDataFormat = null;
        if (el.RequestDataFormat) {
          try {
            RequestDataFormat = JSON.parse(
              el.RequestDataFormat
            ) as ApiTestRequestDataFormatResult[];
          } catch (error) {}
        }
        let headers = undefined;
        if (el.headers) {
          try {
            headers = JSON.parse(el.headers);
          } catch (error) {}
        }
        let globalHeaders = undefined;
        if (el.globalHeaders) {
          try {
            globalHeaders = JSON.parse(
              el.globalHeaders
            ) as ApiTestGlobalHeaderFormat[];
          } catch (error) {}
        }
        let ActualDataFormat = undefined;
        if (el.ActualDataFormat) {
          try {
            ActualDataFormat = JSON.parse(
              el.ActualDataFormat
            ) as ApiTestActualDataFormat;
          } catch (error) {}
        }
        let ExpectedCodeFormat = undefined;
        if (el.ExpectedCodeFormat) {
          try {
            ExpectedCodeFormat = JSON.parse(
              el.ExpectedCodeFormat
            ) as ApiTestExpectedCodeFormat;
            if (ExpectedCodeFormat.listSearch) {
              ExpectedCodeFormat = {
                ...ExpectedCodeFormat,
                listSearch: JSON.parse(
                  ExpectedCodeFormat.listSearch
                ) as string[],
              } as ApiTestExpectedCodeFormatResult;
            }
          } catch (error) {}
        }
        return {
          ...el,
          data,
          RequestDataFormat,
          headers,
          globalHeaders,
          ActualDataFormat,
          url: (el.zmip === 'y' ? zmIp : ip) + el.url,
          ExpectedCodeFormat:
            ExpectedCodeFormat as ApiTestExpectedCodeFormatResult,
        };
      }),
    };
  }) as ApiTestExcelPaneResult[];
};

export const testInterface = async (tabList: ApiTestExcelPane[]) => {
  const globalMap: GlobalMap = {
    sheetParam: {},
    prevresult: [],
    headers: {},
  };
  const tabListResult = parseResult(tabList);
  let i = 0;
  let passNum = 0;
  let failNum = 0;
  while (i < tabListResult.length) {
    const tab = tabListResult[i];
    let j = 0;
    while (j < tab.dataList.length) {
      const data = tab.dataList[j];
      await testInterfaceCase(data, tab.name, tabListResult, globalMap);
      if (data.Result === 'pass') {
        passNum++;
      } else {
        failNum++;
      }
      j++;
    }
    i++;
  }
  Logger.info('结束接口测试啦');
  Logger.info(`测试结果, %c通过: ${passNum}, %c失败: ${failNum}`, [
    'color: green;',
    'color: red;',
  ]);
};
