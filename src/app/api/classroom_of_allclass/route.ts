import pool from "../conn";

export async function GET(request: Request) {
  const [data, f] = await pool.promise().query(`SELECT * FROM \`gradelevel\``);
  let resToJson = JSON.parse(JSON.stringify(data));
  let rooms_of_class = [
    {
        Year : 1,
        rooms : resToJson.map((item) => item.Year == 1 ? item.Number : null).filter(item => item !== null)
    },
    {
        Year : 2,
        rooms : resToJson.map((item) => item.Year == 2 ? item.Number : null).filter(item => item !== null)
    },
    {
        Year : 3,
        rooms : resToJson.map((item) => item.Year == 3 ? item.Number : null).filter(item => item !== null)
    },
    {
        Year : 4,
        rooms : resToJson.map((item) => item.Year == 4 ? item.Number : null).filter(item => item !== null)
    },
    {
        Year : 5,
        rooms : resToJson.map((item) => item.Year == 5 ? item.Number : null).filter(item => item !== null)
    },
    {
        Year : 6,
        rooms : resToJson.map((item) => item.Year == 6 ? item.Number : null).filter(item => item !== null)
    },
  ]
  return Response.json(rooms_of_class);
}