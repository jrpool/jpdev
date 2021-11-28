// code.js
const getV00 = async () => {
  const response = await fetch('vs/v00.json');
  return await response.json();
};
const getPlayerCount = gameData => {
  const limits = gameData.playerCount;
  const count = document.URL.searchParams.playerCount;
  return count && count >= limits[0] && count <= limits[1] ? count : null;
};
const createCode = () => {
  const now = Date.now();
  return now.toString().slice(6, 11);
}
const showAll = async () => {
  const gameData = await getV00();
  const playerCount = getPlayerCount(gameData);
  const {timeLimit} = gameData;
  const code = createCode();
  const shortLink = `join.html?code=${code}`;
  const longLink = `https://jpdev.pro/jpdev/om/${shortLink}`;
  document.getElementById('playerCount').textContent = playerCount;
  document.getElementById('longLink').textContent = longLink;
  document.getElementById('shortLink').href = shortLink;
  document.getElementById('timeLimit').textContent = timeLimit;
  document.getElementById('section').classList.remove('invisible');
};
showAll();
