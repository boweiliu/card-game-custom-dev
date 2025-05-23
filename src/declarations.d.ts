declare module '*.module.less' {
  const classes: { [key: string]: string };
  // export default classes; // WRONG! but llm generates this
  export = classes;
}
