import AppSettingContext from "@/providers/AppSettingProvider";
import { Box } from "@chakra-ui/react";
import { ReactNode, useContext } from "react";
import useDimensions from "react-cool-dimensions";

const PageColWidget = ({ children }: { children: ReactNode }) => {
  const { setCardWidthWidget, cardWidthWidget } = useContext(AppSettingContext);
  const { observe } = useDimensions({
    breakpoints: { XS: 0, SM: 320, MD: 480, LG: 640, XL: 1080 },
    updateOnBreakpointChange: true,
    onResize: ({ currentBreakpoint }) => {
      if (currentBreakpoint == "XL") {
        setCardWidthWidget("33%");
      } else if (currentBreakpoint == "LG") {
        setCardWidthWidget("50%");
      } else if (
        currentBreakpoint == "MD" ||
        currentBreakpoint == "SM" ||
        currentBreakpoint == "XS"
      ) {
        setCardWidthWidget("100%");
      }
    },
  });

  return (
    <>
      <Box
        ref={observe}
        className="page__col"
        sx={{
          ":only-of-type": {
            flex: "0 0 calc(100%)",
            maxWidth: "calc(100%)",
            borderRight: "none",
          },
        }}
        pt="0"
        _first={{
          flex: { base: "100%", w: "calc(100% - 426px)" },
          maxWidth: { base: "100%", w: "calc(100% - 426px)" },
          padding: {
            base: "0",
            x: "0 64px 44px 64px",
          },
        }}
        _even={{
          flexShrink: "0",
          width: { base: "100%", w: "426px" },
          padding: {
            base: "0 ",
            x: "0 64px 44px 64px",
            w: "0 24px 44px 24px",
          },
        }}
      >
        {children}
      </Box>
    </>
  );
};

export default PageColWidget;
