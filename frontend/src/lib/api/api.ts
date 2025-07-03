import ky from "ky";

const BASE_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";


export const api = ky.create({
  prefixUrl: BASE_API_URL,
  credentials: "include"
})
