import { v4 as uuidv4 } from "uuid";

const uuids = Array.from({ length: 46 }, () => uuidv4());

console.log(uuids);
