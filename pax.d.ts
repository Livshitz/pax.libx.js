
declare class Pax {
	
}

// --------------------------------------------------------------------------------

// enables access simply as global var.
declare var pax: Pax;
declare module NodeJS  {
    interface Global {
        pax: Pax;
    }
}

