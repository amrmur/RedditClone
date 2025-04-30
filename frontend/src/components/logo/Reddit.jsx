const RedditImage = ({
  src = "../../public/logo.png",
  alt = "Reddit Clone Logo",
  className = "w-6 h-6",
  ...props
}) => <img src={src} alt={alt} className={className} {...props} />;

export default RedditImage;
