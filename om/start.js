// start.js
const getV00 = async () => {
  const response = await fetch('vs/v00.json');
  return await response.json();
};
const setPlayerCounts = async () => {
  const v00Data = await getV00();
  const {playerCount} = v00Data;
  document.getElementById('playerCountMin').textContent = playerCount[0];
  document.getElementById('playerCountMax').textContent = playerCount[1];
  const spec = document.getElementById('playerCountSpec');
  spec.min = playerCount[0];
  spec.max = playerCount[1];
};
setPlayerCounts();
