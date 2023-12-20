import { TFAOff } from "@/api/auth/2fa";
import { UserDetail, putUserMe, putUserMeAvatar } from "@/api/users/index";
import Avatar from "@/components/Avatar";
import ChipButton from "@/components/button/ChipButton";
import DefaultInput from "@/components/control/DefaultInput";
import TFAModal from "@/components/modal/TFAModal";
import { useModal } from "@/hooks/display/useModal";
import Card from "@/layouts/Card";
import FlexBox from "@/layouts/FlexBox";
import { AxiosError } from "axios";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "react-toastify";

interface Props {
  user: UserDetail | null;
  setUser?: Dispatch<SetStateAction<UserDetail | null>>;
  type: "me" | "other";
}

export default function ProfileCard({ type, user, setUser }: Props) {
  const router = useRouter();
  const [onMouse, setOnMouse] = useState<boolean>(false);
  const { openModal } = useModal();
  const onChange = (key: keyof UserDetail, value: any) => {
    if (!setUser || !user) return;
    setUser((prev: UserDetail | null) => {
      if (!prev) return null;
      return { ...prev, [key]: value };
    });
  };
  const onChangeAvatar = async (file: File | undefined) => {
    if (type === "other") return;
    if (!setUser || !user) return;
    if (file === undefined) return;
    try {
      console.log(file);
      await putUserMeAvatar(file);
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
  const onClickTwoFactor = async () => {
    if (!setUser || !user) return;
    try {
      if (user?.is2fa) {
        await TFAOff();
        setUser((prev: UserDetail | null) => {
          if (!prev) return null;
          return { ...prev, is2fa: false };
        });
      } else openModal(<TFAModal />);
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
  const onBlur = async () => {
    if (!user) return;
    try {
      await putUserMe(user);
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
    <Card>
      <FlexBox className="w-full gap-6" direction="col">
        <FlexBox className="w-full justify-between">
          <div className="text-2xl font-bold">Status</div>
          <div
            className={`text-2xl font-bold ${
              user?.status === "online"
                ? "text-green-cyber"
                : user?.status === "ingame"
                ? "text-red-cyber"
                : "text-gray-300"
            }`}
          >
            {user?.status}
          </div>
        </FlexBox>
        <FlexBox className="w-full justify-between gap-6">
          <div>
            {type === "other" ? (
              <div className="text-5xl font-bold">{user?.nickname}</div>
            ) : (
              <DefaultInput
                className="text-2xl py-2 bg-gray-700"
                value={user?.nickname}
                onChange={(e) => onChange("nickname", e.target.value)}
                onBlur={onBlur}
              />
            )}
            <div className="mt-2 text-gray-300 font-bold">{user?.email}</div>
          </div>
          <div className="relative">
            <Avatar type={user?.avatarImgPath ?? null} />
            {type === "me" && (
              <label htmlFor="file">
                <FlexBox
                  direction="col"
                  className="group/item absolute cursor-pointer rounded-full hover:bg-[#000000CC] 
                top-0 right-0 h-full w-full justify-center text-white"
                >
                  <div className="text-sm invisible group-hover/item:visible">
                    change
                  </div>
                  <input
                    type="file"
                    name="file"
                    id="file"
                    accept=".png"
                    className="hidden"
                    onChange={(e) => {
                      onChangeAvatar(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </FlexBox>
              </label>
            )}
          </div>
        </FlexBox>
        {type === "other" ? (
          <div className="w-full text-gray-300">{user?.bio}</div>
        ) : (
          <>
            <DefaultInput
              className="text-md py-1 bg-gray-700"
              value={user?.bio ?? ""}
              onChange={(e) => onChange("bio", e.target.value)}
              onBlur={onBlur}
            />
            <FlexBox className="w-full justify-between">
              <div className="font-bold">2 factor auth</div>
              <ChipButton
                color={user?.is2fa ? "white-contain" : "white"}
                onClick={onClickTwoFactor}
                onMouseEnter={() => setOnMouse(true)}
                onMouseLeave={() => setOnMouse(false)}
                className="w-16"
              >
                {user?.is2fa !== onMouse ? "ON" : "OFF"}
              </ChipButton>
            </FlexBox>
          </>
        )}
      </FlexBox>
    </Card>
  );
}
