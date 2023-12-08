import { useState } from "react";


const AdminScreen = () => {
  const [buttonEnable, setButtonEnable] = useState<boolean>(true);

  const grab = () => {
    setButtonEnable(false);
    fetch("grabUrl", { method: "POST", body: JSON.stringify({ query: (document.getElementById("linkInput") as HTMLInputElement).value }) })
      .then(response => {
        if (!response.ok) {
          response.text()
            .then(data => {
              alert("Failed: " + data); // data is a string
            })
        }
      })
      .catch((err) => {
        alert("Could not communicate with server: " + err);
      })
      .finally(() => setButtonEnable(true))

  }
  return (
    <div>
      <h1>Hello there mr admin, enter a wikipedia link below</h1>
      <input id="linkInput"></input>
      {buttonEnable ? <button id="submitButton" onClick={grab}>Add to DB</button> : null}
    </div>
  );
}

export default AdminScreen;