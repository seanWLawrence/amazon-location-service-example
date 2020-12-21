import React from "react";
import Amplify from "aws-amplify";
import AWS from "aws-sdk";
import amplifyConfig from "./aws-exports";
import { Signer } from "@aws-amplify/core";
import { Auth } from "aws-amplify";
import Mapbox from "mapbox-gl";

import "./App.css";

Amplify.configure(amplifyConfig);

AWS.config.region = "us-east-1";

function App() {
  const mapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    async function initializeMap() {
      const credentials = await Auth.currentUserCredentials();

      function transformRequest(
        url?: string,
        resourceType?: string
      ): Mapbox.RequestParameters {
        if (resourceType === "Style" && !url?.includes("://")) {
          url = `https://maps.geo.${AWS.config.region}.amazonaws.com/maps/v0/maps/${url}/style-descriptor`;
        }

        if (url?.includes("amazonaws.com")) {
          return {
            url: Signer.signUrl(url, {
              access_key: credentials.accessKeyId,
              secret_key: credentials.secretAccessKey,
              session_token: credentials.sessionToken,
            }),
          };
        }

        return { url: url || "" };
      }

      new Mapbox.Map({
        container: mapRef.current || "map",
        style: "Basic",
        transformRequest,
      });
    }

    initializeMap();
  }, []);

  return (
    <div>
      <div ref={mapRef}></div>
    </div>
  );
}

export default App;
