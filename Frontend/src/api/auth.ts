import { api } from "./interceptor";
import type { User } from "@/types/user";

interface GetMeResponse {
  message: string,
  data?: User
}

export const getMe = async ():Promise<GetMeResponse | null >=> {
    return api.get("auth/me")
};