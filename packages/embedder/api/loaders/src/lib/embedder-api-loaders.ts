import { makeApi, Zodios } from '@zodios/core'
import { z } from 'zod'
import {
  idSchema,
  AddLoaderSchema,
  AddLoaderResponseSchema,
} from '@magickml/embedder-schemas'

export const loaderEndpoints = makeApi([
  {
    method: 'post',
    path: '/packs/:id/loaders',
    alias: 'addLoader',
    description: 'Add a new loader to a pack',
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: idSchema,
      },
      {
        name: 'body',
        type: 'Body',
        schema: AddLoaderSchema,
      },
    ],
    response: AddLoaderResponseSchema,
    errors: [
      {
        status: 400,
        description: 'Invalid Request',
        schema: z.any(),
      },
    ],
  },
  {
    method: 'get',
    path: '/packs/:id/loaders/:loaderId',
    alias: 'getLoader',
    description: 'Get loader with chunks for a specific loader in a pack',
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: idSchema,
      },
      {
        name: 'loaderId',
        type: 'Path',
        schema: idSchema,
      },
    ],
    response: z.any(),
    errors: [
      {
        status: 404,
        description: 'Loader not found',
        schema: z.any(),
      },
    ],
  },
  {
    method: 'delete',
    path: '/packs/:id/loaders/delete',
    alias: 'deleteLoader',
    description: 'Delete a loader from a pack',
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: idSchema,
      },
      {
        name: 'body',
        type: 'Body',
        schema: z.object({
          loaderId: idSchema,
          filePath: z.string(),
        }),
      },
    ],
    response: z.any(),
    errors: [
      {
        status: 404,
        description: 'Loader not found',
        schema: z.any(),
      },
    ],
  },
])

export const loaderApi = new Zodios(loaderEndpoints)
