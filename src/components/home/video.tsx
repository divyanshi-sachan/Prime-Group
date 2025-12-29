import HeroVideoDialog from "../ui/hero-video-dialog";

export function HeroVideoDialogDemoTopInBottomOut() {
  return (
    <div className="relative mt-8 p-8 max-w-7xl mx-auto">
      <HeroVideoDialog
        className="dark:hidden block"
        animationStyle="top-in-bottom-out"
        videoSrc="https://www.youtube.com/embed/Rw3-CYeUjTw"
        thumbnailSrc="https://www.andbeyond.com/wp-content/uploads/sites/5/iStock_000058485880_XXXLarge.jpg"
        thumbnailAlt="Hero Video"
      />
      <HeroVideoDialog
        className="hidden dark:block"
        animationStyle="top-in-bottom-out"
        videoSrc="https://www.youtube.com/embed/Rw3-CYeUjTw"
        thumbnailSrc="https://www.andbeyond.com/wp-content/uploads/sites/5/iStock_000058485880_XXXLarge.jpg"
        thumbnailAlt="Hero Video"
      />
    </div>
  );
}
