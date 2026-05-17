import { z } from "zod";
import {
  apiErrorSchema,
  createAssetUploadUrlRequestSchema,
  createAssetUploadUrlResponseSchema,
  createDiaryAccessRequestRequestSchema,
  createDiaryAccessRequestResponseSchema,
  createDiaryCommentRequestSchema,
  createDiaryCommentResponseSchema,
  createShareRequestSchema,
  createShareResponseSchema,
  generateRoomRequestSchema,
  generateRoomResponseSchema,
  getDiaryResponseSchema,
  getGuessResultParamsSchema,
  getGuessResultResponseSchema,
  getOwnerResultsParamsSchema,
  getOwnerResultsResponseSchema,
  getRoomPlayParamsSchema,
  getRoomPlayResponseSchema,
  listPublicRoomsResponseSchema,
  listRoomsResponseSchema,
  listSharesResponseSchema,
  petChatRequestSchema,
  petChatResponseSchema,
  respondDiaryAccessRequestParamsSchema,
  respondDiaryAccessRequestRequestSchema,
  respondDiaryAccessRequestResponseSchema,
  submitGuessRequestSchema,
  submitGuessResponseSchema
} from "@/lib/schemas/api";

export type ApiError = z.infer<typeof apiErrorSchema>;

export type GenerateRoomRequest = z.infer<typeof generateRoomRequestSchema>;
export type GenerateRoomResponse = z.infer<typeof generateRoomResponseSchema>;

export type GetRoomPlayParams = z.infer<typeof getRoomPlayParamsSchema>;
export type GetRoomPlayResponse = z.infer<typeof getRoomPlayResponseSchema>;

export type SubmitGuessRequest = z.infer<typeof submitGuessRequestSchema>;
export type SubmitGuessResponse = z.infer<typeof submitGuessResponseSchema>;

export type GetGuessResultParams = z.infer<typeof getGuessResultParamsSchema>;
export type GetGuessResultResponse = z.infer<typeof getGuessResultResponseSchema>;

export type GetOwnerResultsParams = z.infer<typeof getOwnerResultsParamsSchema>;
export type GetOwnerResultsResponse = z.infer<typeof getOwnerResultsResponseSchema>;

export type PetChatRequest = z.infer<typeof petChatRequestSchema>;
export type PetChatResponse = z.infer<typeof petChatResponseSchema>;

export type CreateDiaryAccessRequestRequest = z.infer<
  typeof createDiaryAccessRequestRequestSchema
>;
export type CreateDiaryAccessRequestResponse = z.infer<
  typeof createDiaryAccessRequestResponseSchema
>;

export type RespondDiaryAccessRequestParams = z.infer<
  typeof respondDiaryAccessRequestParamsSchema
>;
export type RespondDiaryAccessRequestRequest = z.infer<
  typeof respondDiaryAccessRequestRequestSchema
>;
export type RespondDiaryAccessRequestResponse = z.infer<
  typeof respondDiaryAccessRequestResponseSchema
>;

export type GetDiaryResponse = z.infer<typeof getDiaryResponseSchema>;

export type CreateDiaryCommentRequest = z.infer<
  typeof createDiaryCommentRequestSchema
>;
export type CreateDiaryCommentResponse = z.infer<
  typeof createDiaryCommentResponseSchema
>;

export type CreateAssetUploadUrlRequest = z.infer<
  typeof createAssetUploadUrlRequestSchema
>;
export type CreateAssetUploadUrlResponse = z.infer<
  typeof createAssetUploadUrlResponseSchema
>;

export type ListRoomsResponse = z.infer<typeof listRoomsResponseSchema>;
export type ListPublicRoomsResponse = z.infer<typeof listPublicRoomsResponseSchema>;

export type CreateShareRequest = z.infer<typeof createShareRequestSchema>;
export type CreateShareResponse = z.infer<typeof createShareResponseSchema>;
export type ListSharesResponse = z.infer<typeof listSharesResponseSchema>;

export type ApiRouteContract<Request, Response> = {
  method: "GET" | "POST";
  path: string;
  request: Request;
  response: Response;
  error: ApiError;
};

export type HeartCabinApiContract = {
  generateRoom: ApiRouteContract<GenerateRoomRequest, GenerateRoomResponse>;
  getRoomPlay: ApiRouteContract<never, GetRoomPlayResponse>;
  listRooms: ApiRouteContract<never, ListRoomsResponse>;
  createShare: ApiRouteContract<CreateShareRequest, CreateShareResponse>;
  listShares: ApiRouteContract<never, ListSharesResponse>;
  submitGuess: ApiRouteContract<SubmitGuessRequest, SubmitGuessResponse>;
  getGuessResult: ApiRouteContract<never, GetGuessResultResponse>;
  getOwnerResults: ApiRouteContract<never, GetOwnerResultsResponse>;
  petChat: ApiRouteContract<PetChatRequest, PetChatResponse>;
  createDiaryAccessRequest: ApiRouteContract<
    CreateDiaryAccessRequestRequest,
    CreateDiaryAccessRequestResponse
  >;
  respondDiaryAccessRequest: ApiRouteContract<
    RespondDiaryAccessRequestRequest,
    RespondDiaryAccessRequestResponse
  >;
  getDiary: ApiRouteContract<never, GetDiaryResponse>;
  createDiaryComment: ApiRouteContract<
    CreateDiaryCommentRequest,
    CreateDiaryCommentResponse
  >;
  createAssetUploadUrl: ApiRouteContract<
    CreateAssetUploadUrlRequest,
    CreateAssetUploadUrlResponse
  >;
};
