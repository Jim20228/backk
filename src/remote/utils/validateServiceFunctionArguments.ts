import { CallOrSendToUrlSpec } from "../messagequeue/sendToRemoteServiceInsideTransaction";
import forEachAsyncSequential from "../../utils/forEachAsyncSequential";
import parseRemoteServiceFunctionCallUrlParts from "./parseRemoteServiceFunctionCallUrlParts";
import fs from "fs";
import generateClassFromSrcFile from "../../typescript/generator/generateClassFromSrcFile";
import initializeMicroservice from "../../microservice/initializeMicroservice";
import { plainToClass } from "class-transformer";
import tryValidateServiceFunctionArgument from "../../validation/tryValidateServiceFunctionArgument";
import NullDataStore from "../../datastore/NullDataStore";

export const remoteMicroserviceNameToControllerMap: { [key: string]: any } = {};
const noOpDataStore = new NullDataStore();

export async function validateServiceFunctionArguments(sends: CallOrSendToUrlSpec[]) {
  await forEachAsyncSequential(sends, async ({ serviceFunctionUrl, serviceFunctionArgument }) => {
    const { topic, serviceFunctionName } = parseRemoteServiceFunctionCallUrlParts(serviceFunctionUrl);

    const [serviceName, functionName] = serviceFunctionName.split('.');
    let controller;
    let ServiceClass;

    if (remoteMicroserviceNameToControllerMap[`${topic}$/${serviceName}`]) {
      controller = remoteMicroserviceNameToControllerMap[`${topic}$/${serviceName}`];
      ServiceClass = controller[serviceName].constructor;
    } else {
      let remoteServiceRootDir;

      if (fs.existsSync('../' + topic + '/src')) {
        remoteServiceRootDir = '../' + topic;
      } else if (fs.existsSync('./' + topic + '/src')) {
        remoteServiceRootDir = './' + topic;
      } else {
        return;
      }

      ServiceClass = generateClassFromSrcFile(
        serviceName.charAt(0).toUpperCase() + serviceName.slice(1) + 'Impl',
        remoteServiceRootDir
      );

      const serviceInstance = new ServiceClass(noOpDataStore);

      controller = {
        [serviceName]: serviceInstance
      };

      initializeMicroservice(controller, noOpDataStore, false, '', remoteServiceRootDir);
      remoteMicroserviceNameToControllerMap[`${topic}$/${serviceName}`] = controller;
    }

    const serviceFunctionArgumentClassName =
      controller[`${serviceName}__BackkTypes__`].functionNameToParamTypeNameMap[functionName];

    const ServiceFunctionArgumentClass = controller[serviceName].Types[serviceFunctionArgumentClassName];

    const instantiatedServiceFunctionArgument = plainToClass(
      ServiceFunctionArgumentClass,
      serviceFunctionArgument
    );

    try {
      await tryValidateServiceFunctionArgument(
        ServiceClass,
        functionName,
        noOpDataStore,
        instantiatedServiceFunctionArgument as object
      );
    } catch (error) {
      throw new Error(
        serviceFunctionUrl +
        ': Invalid remote service function callRemoteService argument: ' +
        JSON.stringify(error.message)
      );
    }
  });
}
