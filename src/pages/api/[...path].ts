import { api } from "@/api/network";
import https from "https";
import { AxiosError, AxiosRequestConfig } from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { path } = req.query;
  console.info("API 출발~");
  console.info("method : " + req.method);
  let url = "/";
  if (typeof path === "object") url += path.join("/");
  else url += path || "";

  let isHasExtraQuery = false;
  for (let keys in req.query) {
    if (keys !== "path") {
      if (!isHasExtraQuery) {
        url += "?";
        isHasExtraQuery = true;
      } else url += "&";
      url += `${keys}=${req.query[keys]}`;
    }
  }

  console.info("url : " + url);
  console.info();

  try {
    if (url.includes("/auth/user-redirect") || url.includes("/auth/sign-in"))
      req.headers.cookie = "";
    const requestToServer: AxiosRequestConfig = {
      url: url,
      method: req.method as any,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      headers: {
        "Content-Type": req.headers["content-type"],
        Cookie: req.headers.cookie,
      },
    };
    if (req.method === "POST" || req.method === "PUT") {
      requestToServer.data = req.body;
    }
    console.info("헤더 :", requestToServer.headers);
    //console.info("바디 :", requestToServer.data);
    console.info();
    const axiosRes = await api.request(requestToServer);
    console.info("응답이 왔어요");
    console.info("보낸 바디 :", axiosRes.config.data);
    console.info("보낸 헤더 :", axiosRes.config.headers);
    console.info("헤더 :", axiosRes.headers);
    console.info("바디 :", axiosRes.data);
    console.info();

    const setCookie = axiosRes.headers["set-cookie"] as string[];
    if (setCookie) {
      try {
        const session = setCookie[0]
          .split(";")[0]
          .split("session-cookie=")[1]
          .split(".")[0]
          .substring(4);
        axiosRes.data = { session: session, ...axiosRes.data };
        console.info("세션 쿠키 파싱 완료");
      } catch (error) {}
    }
    res.status(200).setHeader("Set-Cookie", setCookie).json(axiosRes.data);
  } catch (error: any) {
    const axiosError = error as AxiosError<{ message: string }>;
    console.info("에러가 났어요");
    console.info("요청했던 헤더 :", axiosError.response?.config.headers);
    console.info("에러 :", axiosError.response?.data);
    console.info();
    res
      .status(axiosError.response?.status || 500)
      .json(axiosError.response?.data);
  }
}
