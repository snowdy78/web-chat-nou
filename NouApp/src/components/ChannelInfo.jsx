import React from "react";
import { useWebSocket, useStore } from "../hooks";
import "./css/ChannelInfo.css";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

export function ChannelInfo() {
  const params = useParams();
  const responseActions = React.useRef({
    channel: onChannel,
    removemember: onRemoveMembers,
  });
  const store = useStore();
  const [isChannelAuthor, setIsChannelAuthor] = React.useState(false);
  const [filterName, setFilterName] = React.useState('');
  const ws = useWebSocket(() => {
    ws.current.onopen = () => {
      ws.current.onmessage = (messageEvent) => {
        const response = JSON.parse(messageEvent.data);
        if (!response) {
          console.error("Invalid response.");
        } else if (response.error) {
          console.error(response.error.message);
        } else if (response.type && responseActions.current[response.type]) {
          responseActions.current[response.type](response);
        } else {
          console.warn("Invalid response.", response);
        }
      };
      ws.current.send(
        JSON.stringify({
          type: "channel",
          username: store.user.name,
          channelName: params.name,
        })
      );
    };
  });
  const [members, setMembers] = React.useState([]);
  function onChannel(body) {
    if (store.user.name === body.data.authorName) {
      setIsChannelAuthor(() => store.user.name === body.data.authorName);
    }
    setMembers(() => [...body.data.members]);
  }
  function onRemoveMembers(body) {
    if (body.newAuthor && store.user.name === body.newAuthor) {
      setIsChannelAuthor(true);
    }
    setMembers((prevMembers) => {
      const memberIndex = prevMembers.findIndex(member => body.membername === member);
      if (memberIndex === -1) {
        console.warn('Member not found');
        return prevMembers;
      }
      if (prevMembers[memberIndex] === store.user.name) {
        window.location = '/channels';
        return;
      }
      prevMembers.splice(memberIndex, 1);
      return [...prevMembers];
    });
  }
  function searchMembers(e) {
    setFilterName(e.target.value);
  }
  function removeMember(e, memberIndex) {
    const member = members[memberIndex];
    if (!member) {
      console.warn('member not found');
      return;
    }
    if (ws.current.readyState) {
      ws.current.send(JSON.stringify({type: 'removemember', username: store.user.name, membername: member, channelName: params.name}));
    }
  }
  return (
    <div className="channel-info">
      <div className='channel-info__header'>
        <button className="channel-info__header__back-button" onClick={ () => window.history.back() }>&lt;</button>
      </div>
      <div className="channel-info__channel-name">{params.name}</div>
      <div className="channel-info__header-members">Members</div>
      <div className='channel-info__hz-line'/>
      <input type="text" className="search-member-input" placeholder="Type name..." onChange={searchMembers}/>
      <div className="channel-info__member-list">
        {members.length === 0 ? (
          <div className="channel-info__member-list__no-members">
            Channel has no members? How is it possible LOL??
          </div>
        ) : (
          members.map((value, index) => {
            if (filterName && value.indexOf(filterName) === -1) {
              return <div key={`channel-info__member-list__member${index}`} style={{display: 'none'}}></div>;
            }
            return (
              <div
                key={`channel-info__member-list__member${index}`}
                className="channel-info__member-list__member"
              >
                <div className="channel-info__member-list__member__name">{value}</div>
                {
                  isChannelAuthor
                  ?
                  <div className='channel-info__member-list__member__kick'><button className="bi-ban" onClick={(e) => removeMember(e, index)}/></div>
                  : 
                  null
                }
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
