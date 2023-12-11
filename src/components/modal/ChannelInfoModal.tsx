import { MemberAbstract, MemberDetail, getChannel } from "@/api/channels";
import { getBanMemberList, removeBanMember } from "@/api/channels/operate";
import useChatInfo from "@/hooks/data/useChatInfo";
import FlexBox from "@/layouts/FlexBox";
import ScrollBox from "@/layouts/ScrollBox";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function ChannelInfoModal() {
  const { chatInfo } = useChatInfo();

  if (chatInfo.index === null) {
    console.log("ChannelInfoModal(): chatInfo.index ===null");
    return <></>;
  }

  const channel = chatInfo.channelList[chatInfo.index];

  const [memberList, setMemberList] = useState<MemberDetail[]>([]);
  const [bannedList, setBannedList] = useState<MemberAbstract[]>([]);

  const getData = async () => {
    try {
      const memberData = (await getChannel(channel.id)).data;
      const bannedData = (await getBanMemberList(channel.id)).data;
      setMemberList(memberData.users);
      setBannedList(bannedData);
    } catch (error) {
      const AxiosError = error as AxiosError;
      toast.error(AxiosError.response?.status);
    }

  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <FlexBox
      direction="col"
      className="w-[600px] h-[450px] gap-3 p-6 bg-gray-600"
    >
      <FlexBox direction="col" className="w-full h-fit gap-2">
        <FlexBox direction="row" className="w-full h-fit border-b-2">
          <div className="w-1/2 text-2xl pb-2 tracking-wider">
            {channel.title}
          </div>
          <div className="w-1/2 text-base tracking-wider text-right">
            {channel.type}
          </div>
        </FlexBox>
        <div className="w-full h-fit text-s">👑: owner 👤: admin</div>
      </FlexBox>
      <FlexBox direction="row" className="w-full h-full gap-6">
        <FlexBox direction="col" className="w-1/2 h-full gap-2 p-2 border">
          <div className="w-full h-fit p-1 text-xl border-b-2">Member</div>
          <ScrollBox className="max-h-[280px]">
            <FlexBox direction="col" className="w-full h-full gap-2 p-1">
              {memberList !== null &&
                memberList.map((_mem, idx) => {
                  return (
                    <div key={idx} className="w-full h-fit">
                      {_mem.nickname}
                      {_mem.role === "Owner" && " 👑"}
                      {_mem.role === "Admin" && " 👤"}
                    </div>
                  );
                })}
            </FlexBox>
          </ScrollBox>
        </FlexBox>
        <FlexBox direction="col" className="w-1/2 h-full gap-2 p-2 border">
          <div className="w-full h-fit p-1 text-xl border-b-2">
            Banned Member
          </div>
          <ScrollBox className="max-h-[280px]">
            <FlexBox direction="col" className="w-full h-full gap-2 p-1">
              {bannedList.map((_mem, idx) => {
                return (
                  <FlexBox
                    className="w-full h-fit justify-between"
                    key={idx}
                    direction="row"
                  >
                    <div className="w-fit h-fit">{_mem.nickname}</div>
                    {(chatInfo.role === "Owner" ||
                      chatInfo.role === "Admin") && (
                      <button
                        onClick={async () => {
                          try {
                            await removeBanMember(channel.id, _mem.id);
                            getData();
                          } catch (error) {
                            const axiosError = error as AxiosError;
                            toast.error(axiosError.response?.status);
                          }
                        }}
                        className="text-xs font-bold px-2 py-1 border-[1.5px] border-deepred-cyber hover:bg-deepred-cyber hover:text-black"
                      >
                        X
                      </button>
                    )}
                  </FlexBox>
                );
              })}
            </FlexBox>
          </ScrollBox>
        </FlexBox>
      </FlexBox>
    </FlexBox>
  );
}
