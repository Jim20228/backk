import AbstractSqlDbManager from '../../../AbstractSqlDbManager';
import transformRowsToObjects from './transformresults/transformRowsToObjects';
import createBackkErrorFromError from '../../../../errors/createBackkErrorFromError';
import { PostQueryOperations } from '../../../../types/postqueryoperations/PostQueryOperations';
import getSqlSelectStatementParts from './utils/getSqlSelectStatementParts';
import updateDbLocalTransactionCount from './utils/updateDbLocalTransactionCount';
import getTableName from '../../../utils/getTableName';
import createBackkErrorFromErrorCodeMessageAndStatus from '../../../../errors/createBackkErrorFromErrorCodeMessageAndStatus';
import { BACKK_ERRORS } from '../../../../errors/backkErrors';
import { PromiseErrorOr } from '../../../../types/PromiseErrorOr';
import { getNamespace } from 'cls-hooked';
import getClassPropertyNameToPropertyTypeNameMap from '../../../../metadata/getClassPropertyNameToPropertyTypeNameMap';
import DefaultPostQueryOperations from '../../../../types/postqueryoperations/DefaultPostQueryOperations';
import { Many } from '../../../AbstractDbManager';
import createCurrentPageTokens from '../../../utils/createCurrentPageTokens';
import tryEnsurePreviousOrNextPageIsRequested from "../../../utils/tryEnsurePreviousOrNextPageIsRequested";
import EntityCountRequest from "../../../../types/EntityCountRequest";

export default async function getEntitiesByIds<T>(
  dbManager: AbstractSqlDbManager,
  _ids: string[],
  EntityClass: new () => T,
  postQueryOperations: PostQueryOperations,
  allowFetchingOnlyPreviousOrNextPage: boolean,
  entityCountRequests?: EntityCountRequest[]
): PromiseErrorOr<Many<T>> {
  try {
    if (allowFetchingOnlyPreviousOrNextPage) {
      tryEnsurePreviousOrNextPageIsRequested(postQueryOperations.currentPageTokens, postQueryOperations.paginations);
    }

    updateDbLocalTransactionCount(dbManager);

    let isSelectForUpdate = false;

    if (
      getNamespace('multipleServiceFunctionExecutions')?.get('globalTransaction') ||
      dbManager.getClsNamespace()?.get('globalTransaction') ||
      dbManager.getClsNamespace()?.get('localTransaction')
    ) {
      isSelectForUpdate = true;
    }

    const {
      rootSortClause,
      rootPaginationClause,
      columns,
      joinClauses,
      outerSortClause
    } = getSqlSelectStatementParts(
      dbManager,
      postQueryOperations ?? new DefaultPostQueryOperations(),
      EntityClass,
      undefined,
      entityCountRequests
    );

    const numericIds = _ids.map((id) => {
      const numericId = parseInt(id, 10);

      if (isNaN(numericId)) {
        throw createBackkErrorFromErrorCodeMessageAndStatus({
          ...BACKK_ERRORS.INVALID_ARGUMENT,
          message: BACKK_ERRORS.INVALID_ARGUMENT.message + ' all _ids must be numeric values'
        });
      }

      return numericId;
    });

    const entityMetadata = getClassPropertyNameToPropertyTypeNameMap(EntityClass);
    const idFieldName = entityMetadata._id ? '_id' : 'id';
    const idPlaceholders = _ids.map((_, index) => dbManager.getValuePlaceholder(index + 1)).join(', ');
    const tableName = getTableName(EntityClass.name);
    const tableAlias = dbManager.schema + '_' + EntityClass.name.toLowerCase();

    const shouldReturnRootEntityCount = !!entityCountRequests?.find(
      (entityCountRequest) =>
        entityCountRequest.subEntityPath === '' || entityCountRequest.subEntityPath === '*'
    );

    const selectStatement = [
      `SELECT ${columns} FROM (SELECT *${
          shouldReturnRootEntityCount ? ', COUNT(*) OVER() AS _count' : ''
        } FROM ${dbManager.schema}.${tableName}`,
      `WHERE ${idFieldName} IN (${idPlaceholders}`,
      rootSortClause,
      rootPaginationClause,
      `) AS ${tableAlias}`,
      joinClauses,
      outerSortClause,
      isSelectForUpdate ? dbManager.getUpdateForClause(tableAlias) : undefined
    ]
      .filter((sqlPart) => sqlPart)
      .join(' ');

    const result = await dbManager.tryExecuteQuery(selectStatement, numericIds);

    if (dbManager.getResultRows(result).length === 0) {
      return [
        null,
        createBackkErrorFromErrorCodeMessageAndStatus({
          ...BACKK_ERRORS.ENTITY_NOT_FOUND,
          message: `${EntityClass.name}s with _ids: ${_ids.join(', ')} not found`
        })
      ];
    }

    const entities = transformRowsToObjects(
      dbManager.getResultRows(result),
      EntityClass,
      postQueryOperations ?? new DefaultPostQueryOperations(),
      dbManager,
      entityCountRequests
    );

    return [
      {
        metadata: {
          currentPageTokens: allowFetchingOnlyPreviousOrNextPage
            ? createCurrentPageTokens(postQueryOperations.paginations)
            : undefined
        },
        data: entities
      },
      null
    ];
  } catch (error) {
    return [null, createBackkErrorFromError(error)];
  }
}
