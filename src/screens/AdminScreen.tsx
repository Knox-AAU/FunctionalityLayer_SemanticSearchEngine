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

  const reset = () => {
    fetch("reset", {
      method: "POST",
    })
      .then((response) => {
        if (response.ok) {
          alert("Restarting server and rebuilding embeddings, this will take a while\n\
                There will be no notification when this is done");
        } else {
          alert("Error, idk man");
        }
      })
  }

  return (



    <div
      className="input-bar ml-8 border-2 border-gray-900 rounded-lg mb-2 w-4/5 pl-6 py-2 bg-darkgrey ">
      <h1>Hello there mr admin, enter a wikipedia link below</h1>
      <p>After clicking "Add to DB" the button disapears and comes back without a popup on a successful grab </p>
      <input
        id="linkInput"
        type="text"
        className="border p-2 mr-2 w-4/5"
      />
      {buttonEnable ? <button id="submitButton" onClick={grab} className="bg-blue-500 text-white p-2 rounded mr-2">Add to DB</button> : null}

      <button onClick={reset} className="bg-blue-500 text-white p-2 rounded mr-2" >Reset</button>
    </div>
  );
}

export default AdminScreen;