import { FC, useState } from "react";

export interface BarGraphProps {
  data: Map<number, number>;
}

export const BarGraph: FC<BarGraphProps> = ({ data }) => {
  return (
    <div>
      {[...data.entries()].map(([k, v]) => (
        <div
          key={k}
          style={{
            width: `${v * 100}%`,
            height: "18px",
            backgroundColor: "darkgray",
          }}
        />
      ))}
    </div>
  );
};

// function stats(data:Map<number,number>) {
//     let min = Infinity, max = -Infinity

//     for (const datum of data.entries()) {
//         if ()
//     }
// }
