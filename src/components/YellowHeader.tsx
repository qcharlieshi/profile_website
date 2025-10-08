import type { YellowHeaderProps } from "@/types";

export default function YellowHeader({ yellowCardStyle }: YellowHeaderProps) {
  return (
    <div className="yellowCard" style={yellowCardStyle}>
      <div className="headerText">Full Stack Software Engineer & Designer</div>
      <hr className="fancy" />
      <div className="bodyText">
        <p>
          Hello, my name is <b>Charlie Shi</b> and I'm a software engineer that
          graduated from Emory University in 2013 with a finance degree. After
          spending some time in banking and consulting I made the decision to
          get back to my first love, software engineering, by taking the
          full-time web immersive program at Fullstack Academy. My current
          expertise lies in web development whether its creating a server to
          serve up a RESTful API or carefully crafting a beautiful component in
          React and CSS. I pride myself by having a mix of technical skill and
          creative ingenuity.
        </p>

        <p>
          To view the rest of my developer story click here. You can view my
          resume in the about section of your navbar or find my contact
          information by scrolling further down.
        </p>
      </div>
    </div>
  );
}
