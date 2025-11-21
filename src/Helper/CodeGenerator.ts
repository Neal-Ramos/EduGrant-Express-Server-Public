export const GenerateCode = async (length: number): Promise<string> => {
  let code: string = '';
  while (code.length < length) {
    const number: number = Math.floor(Math.random() * 10);
    code += number.toString();
  }
  return code;
};
