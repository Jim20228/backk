import serviceFunctionAnnotationContainer from '../decorators/service/function/serviceFunctionAnnotationContainer';
import BaseService from '../service/BaseService';
import { ServiceMetadata } from './types/ServiceMetadata';
import getClassPropertyNameToPropertyTypeNameMap from './getClassPropertyNameToPropertyTypeNameMap';
import { FunctionMetadata } from './types/FunctionMetadata';
import getValidationMetadata from './getValidationMetadata';
import getTypeDocumentation from './getTypeDocumentation';
import getTypePropertyAccessType from './getTypePropertyAccessType';
import CrudEntityService from '../service/crudentity/CrudEntityService';
import assertFunctionNamesAreValidForCrudEntityService from '../service/crudentity/assertFunctionNamesAreValidForCrudEntityService';
import AbstractDataStore from '../datastore/AbstractDataStore';
import entityAnnotationContainer from '../decorators/entity/entityAnnotationContainer';
import isCreateFunction from '../service/crudentity/utils/isCreateFunction';
import { ErrorNameToErrorDefinitionMap } from "../types/ErrorDefinition";

export default function generateServicesMetadata<T>(
  controller: T,
  dataStore: AbstractDataStore,
  remoteServiceRootDir = ''
): ServiceMetadata[] {
  // noinspection FunctionWithMoreThanThreeNegationsJS
  return Object.entries(controller)
    .filter(
      ([serviceName, service]: [string, any]) =>
        service instanceof BaseService || (remoteServiceRootDir && !serviceName.endsWith('__BackkTypes__'))
    )
    .map(([serviceName, service]: [string, any]) => {
      const ServiceClass = service.constructor;

      const functionNames = Object.keys(
        (controller as any)[`${serviceName}__BackkTypes__`].functionNameToReturnTypeNameMap
      );

      if (service instanceof CrudEntityService) {
        assertFunctionNamesAreValidForCrudEntityService(ServiceClass, functionNames);
      }

      const typesMetadata = Object.entries((controller as any)[serviceName].Types ?? {}).reduce(
        (accumulatedTypes, [typeName, Class]: [string, any]) => {
          const typeObject = getClassPropertyNameToPropertyTypeNameMap(Class, dataStore, true);

          return { ...accumulatedTypes, [typeName]: typeObject };
        },
        {}
      );

      const publicTypesMetadata = Object.entries((controller as any)[serviceName].PublicTypes ?? {}).reduce(
        (accumulatedTypes, [typeName, typeClass]: [string, any]) => {
          const typeObject = getClassPropertyNameToPropertyTypeNameMap(typeClass, dataStore, false);
          return { ...accumulatedTypes, [typeName]: typeObject };
        },
        {}
      );

      // noinspection FunctionWithMoreThanThreeNegationsJS
      const functions: FunctionMetadata[] = functionNames
        .filter(
          (functionName) =>
            !serviceFunctionAnnotationContainer.isServiceFunctionAllowedForServiceInternalUse(
              (controller as any)[serviceName].constructor,
              functionName
            )
        )
        .map((functionName: string) => {
          if (
            !remoteServiceRootDir &&
            !serviceFunctionAnnotationContainer.isServiceFunctionAllowedForEveryUserForOwnResources(ServiceClass, functionName) &&
            !serviceFunctionAnnotationContainer.isServiceFunctionAllowedForClusterInternalUse(
              ServiceClass,
              functionName
            ) &&
            !serviceFunctionAnnotationContainer.isServiceFunctionAllowedForEveryUser(
              ServiceClass,
              functionName
            ) &&
            serviceFunctionAnnotationContainer.getAllowedUserRoles(ServiceClass, functionName).length === 0 &&
            !serviceFunctionAnnotationContainer.isServiceFunctionAllowedForServiceInternalUse(
              ServiceClass,
              functionName
            ) &&
            !serviceFunctionAnnotationContainer.isServiceFunctionAllowedForTests(
              ServiceClass,
              functionName
            ) &&
            !serviceFunctionAnnotationContainer.hasOnStartUp(ServiceClass, functionName)
          ) {
            throw new Error(serviceName + '.' + functionName + ': is missing authorization annotation');
          }

          const functionArgumentTypeName = (controller as any)[`${serviceName}__BackkTypes__`]
            .functionNameToParamTypeNameMap[functionName];

          if (
            isCreateFunction(service.constructor, functionName) &&
            functionArgumentTypeName &&
            !(typesMetadata as any)[functionArgumentTypeName].captchaToken &&
            !serviceFunctionAnnotationContainer.hasNoCaptchaAnnotationForServiceFunction(
              service.constructor,
              functionName
            )
          ) {
            throw new Error(
              serviceName +
                '.' +
                functionName +
                ': argument type must implement Captcha or service function must be annotated with @NoCaptcha() annotation'
            );
          }

          const returnValueTypeName: string = (controller as any)[`${serviceName}__BackkTypes__`]
            .functionNameToReturnTypeNameMap[functionName];

          const functionStr = service[functionName].toString();
          const errors = Object.entries(service.errors as ErrorNameToErrorDefinitionMap ?? [])
            .filter(([errorName]) => functionStr.includes(errorName))
            .map(([, errorDefinition]) => errorDefinition);

          return {
            functionName,
            functionDocumentation: (controller as any)[`${serviceName}__BackkTypes__`]
              .functionNameToDocumentationMap[functionName],
            argType: functionArgumentTypeName,
            returnValueType: returnValueTypeName,
            errors
          };
        });

      const validationMetadatas = Object.entries((controller as any)[serviceName].PublicTypes ?? {}).reduce(
        (accumulatedTypes, [typeName, typeClass]: [string, any]) => {
          const validationMetadata = getValidationMetadata(typeClass);
          if (Object.keys(validationMetadata).length > 0) {
            return { ...accumulatedTypes, [typeName]: validationMetadata };
          }
          return accumulatedTypes;
        },
        {}
      );

      const propertyAccess = Object.entries((controller as any)[serviceName].PublicTypes ?? {}).reduce(
        (accumulatedPropertyAccess, [typeName, typeClass]: [string, any]) => {
          const propertyModifiers = getTypePropertyAccessType((typesMetadata as any)[typeName], typeClass);
          return Object.keys(propertyModifiers).length > 0
            ? { ...accumulatedPropertyAccess, [typeName]: propertyModifiers }
            : accumulatedPropertyAccess;
        },
        {}
      );

      const typesDocumentation = Object.entries((controller as any)[serviceName].PublicTypes ?? {}).reduce(
        (accumulatedTypesDocumentation, [typeName, typeClass]: [string, any]) => {
          const typeDocumentation = getTypeDocumentation((typesMetadata as any)[typeName], typeClass);
          return Object.keys(typeDocumentation).length > 0
            ? { ...accumulatedTypesDocumentation, [typeName]: typeDocumentation }
            : accumulatedTypesDocumentation;
        },
        {}
      );

      const typeReferences = Object.entries((controller as any)[serviceName].PublicTypes ?? {}).reduce(
        (accumulatedTypeReferences, [typeName, typeClass]: [string, any]) => {
          if (
            entityAnnotationContainer.isEntity(typeClass) &&
            entityAnnotationContainer.entityNameToTableNameMap[typeName]
          ) {
            return {
              ...accumulatedTypeReferences,
              [typeName]: entityAnnotationContainer.entityNameToTableNameMap[typeName]
            };
          }

          return accumulatedTypeReferences;
        },
        {}
      );

      return {
        serviceName,
        serviceDocumentation: (controller as any)[`${serviceName}__BackkTypes__`].serviceDocumentation,
        functions,
        publicTypes: {
          ...publicTypesMetadata,
          ErrorResponse: {
            statusCode: 'integer',
            errorCode: '?string',
            errorMessage: 'string',
            stackTrace: '?string'
          }
        },
        types: {
          ...typesMetadata,
          BackkError: {
            statusCode: 'integer',
            errorCode: '?string',
            message: 'string',
            stackTrace: '?string'
          }
        },
        propertyAccess,
        typesDocumentation,
        typeReferences,
        validations: validationMetadatas
      };
    });
}
