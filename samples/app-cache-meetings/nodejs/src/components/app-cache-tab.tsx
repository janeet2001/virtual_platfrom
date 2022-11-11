// <copyright file="app-cache-tab.tsx" company="Microsoft Corporation">
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// </copyright>

import { useState } from "react";
import React from "react";
import * as microsoftTeams from "@microsoft/teams-js";

/// </summary>
/// function logitem
/// </summary>
function logItem(action: string, actionColor: string, message: string) {
  const newItem =
    "<span style='font-weight:bold;color:" +
    actionColor +
    "'>" +
    action +
    "</span> " +
    message +
    "</br>";
  return newItem;
}

/// </summary>
/// In beforeUnloadHandler using setItems and readyToUnload callback function
/// </summary>
const beforeUnloadHandler = (
  setItems: React.Dispatch<React.SetStateAction<string[]>>,
  readyToUnload: () => void
) => {
  console.log("got beforeUnload from TEAMS");
  let newItem = logItem("OnBeforeUnload", "purple", "Started");
  setItems((oldItems) => [...oldItems, newItem]);
  newItem = logItem("OnBeforeUnload", "purple", "Completed");
  setItems((oldItems) => [...oldItems, newItem]);
  console.log("sending readyToUnload to TEAMS");
  readyToUnload();
  return true;
};

/// </summary>
/// loadHandler 
/// </summary>
const loadHandler = (
  setItems: React.Dispatch<React.SetStateAction<string[]>>,
  data: microsoftTeams.LoadContext
) => {
  console.log("got load from TEAMS", data);
  logItem("OnLoad", "blue", "Started for " + data.entityId);
  let newItem = logItem("OnLoad", "blue", "Completed for " + data.entityId);
  setItems((oldItems) => [...oldItems, newItem]);
  microsoftTeams.app.notifySuccess();
};

const AppCacheTab = () => {
  const [items, setItems] = useState<string[]>([]);
  const [title, setTitle] = useState("App Cache Testing Sample");
  const [initState] = useState(true);

  React.useEffect(() => {
    if (!initState) {
      return;
    }

    // get context
    microsoftTeams.app.initialize().then(() => {
      microsoftTeams.app.getContext().then((context) => {
        const newItem = logItem("Success", "green", "Loaded Teams context");
        setItems((oldItems) => [...oldItems, newItem]);
        setTitle(title);
        const newItem2 = logItem("FrameContext", "orange", "Frame context is " + context.page.frameContext);
        setItems((oldItems) => [...oldItems, newItem2]);

        if (context.page.frameContext === "sidePanel") {
          // OnBeforeUnload
          microsoftTeams.teamsCore.registerBeforeUnloadHandler((readyToUnload) => {
            const result = beforeUnloadHandler(setItems, readyToUnload);
            return result;
          });

          // OnLoad
          microsoftTeams.teamsCore.registerOnLoadHandler((data) => {
            loadHandler(setItems, data);
          });
          const newItem = logItem("Handlers", "orange", "Registered load and before unload handlers. Ready for app caching.");
          setItems((oldItems) => [...oldItems, newItem]);
        }
        else {
          let newItem = logItem("ERROR", "red", "could not get context");
          setItems((oldItems) => [...oldItems, newItem]);
        }
      });
    });
    return () => {
      console.log("useEffect cleanup - Tab");
    };
  }, [initState]);

  const jsx = initState ? (
    <div>
      <h3>{title}</h3>
      {items.map((item) => {
        return <div dangerouslySetInnerHTML={{ __html: item }} />;
      })}
    </div>
  ) : (
    <div style={{ color: "white" }}>loading</div>
  );
  return jsx;
};

export default AppCacheTab;