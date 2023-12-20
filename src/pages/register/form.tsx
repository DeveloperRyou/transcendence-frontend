import { register } from "@/api/auth/login";
import SpinningLoad from "@/components/SpinningLoad";
import Button from "@/layouts/Button";
import FlexBox from "@/layouts/FlexBox";
import SideBox from "@/layouts/SideBox";
import TextBox from "@/layouts/TextBox";
import { AxiosError } from "axios";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-toastify";

export default function Register() {
  const router = useRouter();
  const [isClicked, setIsClicked] = useState(false);
  const [nickName, setNickName] = useState("");

  const myInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickName(e.target.value);
  };

  const onClickBtn = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsClicked(true);
    try {
      const res = await register(nickName);
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
    setIsClicked(false);
  };

  return (
    <SideBox>
      <FlexBox direction="col" className="items-start gap-8">
        <FlexBox direction="col" className="items-start gap-3 ">
          <div className="text-black font-bold text-5xl tracking-wider leading-[3.5rem]">
            Register
          </div>
        </FlexBox>
        <FlexBox direction="col" className="items-end gap-1">
          <TextBox
            inputNickname={myInput}
            placeholder="Nickname"
            className="w-[25rem] h-[3rem] font-bold text-2xl tracking-wider bg-gray-100"
          />
          <div className="h-[20px] w-fit">
            {nickName.length > 10 ? (
              <div className="text-sm tracking-wider text-red-cyber">
                Must be less than 10 characters
              </div>
            ) : (
              ""
            )}
          </div>
        </FlexBox>

        <Button
          onClickBtn={onClickBtn}
          className="border rounded w-[25rem] h-[3rem] bg-gray-500"
          textClassName="font-bold text-2xl tracking-wider"
        >
          {isClicked ? <SpinningLoad /> : "Complete"}
        </Button>
      </FlexBox>
    </SideBox>
  );
}
