import "./App.css";
import web3 from "./web3";
import lottery from "./lottery";

import React, { useState, useEffect } from "react";

const App = () => {
  const [manager, setManager] = useState("");
  const [balance, setBalance] = useState("");
  const [players, setPlayers] = useState([]);
  const [value, setValue] = useState("");
  const [waitMessage, setWaitMessage] = useState("");
  const [winner, setWinner] = useState("No winner has been selected..");
  const [winnerHash, setWinnerHash] = useState(undefined)

  useEffect(async () => {
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);
    setManager(manager);
    setBalance(balance);
    setPlayers(players);
  }, []);

  const pickWinner = async (event) => {
    event.preventDefault();

    const accounts = await web3.eth.getAccounts();
    setWinner("Picking winner..");
    await lottery.methods.pickWinner().send({
      from: accounts[0],
    });
    await lottery.methods.lastWinner().call((err, result) =>{
      if (err) {
        console.log(err)
      } else {
        console.log(result)
        setWinnerHash(result)
      }
    })
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    const accounts = await web3.eth.getAccounts();
    setWaitMessage(
      "Transaction is being sent to Ethereum blockchain... please wait."
    );
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei(value, "ether"),
    });
    setWaitMessage("Transaction added to blockchain successfully");
  };

  return (
    <div>
      <h2>Lottery Contract</h2>
      <p>
        This contract is managed by: {manager}. <br />
        There are currently {players.length} people entered to win the lottery!{" "}
        <br />
        The current valuation of the lottery is:{" "}
        {web3.utils.fromWei(balance, "ether")}
        ether!
      </p>

      <hr />

      <form onSubmit={onSubmit}>
        <h4>Want to try your luck?</h4>
        <h3>{waitMessage}</h3>
        <div>
          <label>Amount of ether to enter</label>
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </div>
        <br />
        <button type="submit">Enter Into Lottery</button>
      </form>

      <ul>
        {players.map((player) => (
          <li>{player}</li>
        ))}
      </ul>

      <button onClick={pickWinner}>Pick Winner</button>
      <br />
      <br />
      {winnerHash ? `Winner is: ${winnerHash}!` : winner}
    </div>
  );
};
export default App;
