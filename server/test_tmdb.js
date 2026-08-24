import axios from 'axios';

const testKeys = [
  '84244903a4292334f8e4e2a35b861919',
  '3fd2be6f0c70a2a598f084dd2754877e',
  'a8b70b961082c55e63df168d2c6453ee',
  '4f82155a140a11576e47757ee635742a',
  'b9bd48a6039f04ae4b96551b6d0061b6',
  'f7f7422f677b10291e1d087964724a49',
  'c625a69ee9ed68a9ffb4923f114c0a52',
  '15d2ea6d0dc1d476efbca3ecc2e77443'
];

async function check() {
  for (const k of testKeys) {
    try {
      const res = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${k}&query=Batman`);
      if (res.data && res.data.results) {
        console.log(`WORKING_KEY:${k}`);
        process.exit(0);
      }
    } catch (e) {
      console.log(`Key ${k} failed: ${e.message}`);
    }
  }
}
check();
