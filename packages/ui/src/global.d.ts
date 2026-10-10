declare module '*.css';
declare module '*.png' {
  const src: string | { src: string };
  export default src;
}
