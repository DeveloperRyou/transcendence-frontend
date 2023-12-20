import { login } from "@/api/auth/login";
import { testLogin } from "@/api/testLogin";
import SpinningLoad from "@/components/SpinningLoad";
import Button from "@/layouts/Button";
import FlexBox from "@/layouts/FlexBox";
import SideBox from "@/layouts/SideBox";
import { AxiosError } from "axios";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-toastify";

export default function Login() {
  const [isClicked, setIsClicked] = useState(false);
  const router = useRouter();
  const onClickBtn = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsClicked(true);
    try {
      const res = await login(
        window.location.protocol + "//" + window.location.host + "/register"
      );
      router.push(res.data?.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      if (axiosError.response?.status === 401) {
        router.push("/login");
        return;
      }
      if (typeof axiosError.response?.data.message === "object")
        toast.error(axiosError.response?.data.message[0]);
      else toast.error(axiosError.response?.data.message);
    }
  };

  const onClickTest = async (num: number) => {
    try {
      const res = await testLogin(num);
      if (res.data?.session !== undefined && res.data?.session !== null) {
        sessionStorage.setItem("session", res.data?.session);
      }
      router.push("/main");
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      if (axiosError.response?.status === 401) {
        router.push("/login");
        return;
      }
      if (typeof axiosError.response?.data.message === "object")
        toast.error(axiosError.response?.data.message[0]);
      else toast.error(axiosError.response?.data.message);
    }
  };

  return (
    <SideBox animate>
      <FlexBox direction="col" className="items-start box-border gap-9">
        <FlexBox direction="col" className="items-start gap-3 ">
          <div className="text-black font-bold text-5xl tracking-wider leading-[3.5rem]">
            Login
          </div>
          <div className="text-black font-bold text-xl tracking-wider">
            Use 42 Account
          </div>
        </FlexBox>
        <Button
          onClickBtn={onClickBtn}
          className="border rounded w-[25rem] h-[3rem]"
          textClassName="font-bold text-2xl tracking-wider"
        >
          {isClicked ? <SpinningLoad /> : "42 Intra로 로그인"}
        </Button>
      </FlexBox>
    </SideBox>
  );
}
