import { useState, useEffect } from "react";
import Lottie from "lottie-react";

interface LottieFromPathProps {
  /** Public path to the Lottie JSON (e.g. "/Shopping%20Cart%20Loader.json") */
  path: string;
  loop?: boolean;
  className?: string;
}

export function LottieFromPath({ path, loop = true, className }: LottieFromPathProps) {
  const [data, setData] = useState<object | null>(null);

  useEffect(() => {
    fetch(path)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Not found"))))
      .then(setData)
      .catch(() => setData(null));
  }, [path]);

  if (!data) return null;
  return <Lottie animationData={data} loop={loop} className={className} />;
}
