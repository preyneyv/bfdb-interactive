export const adder = `
  ++       Cell c0 = 2
  > +++++  Cell c1 = 5

  [        Start your loops with your cell pointer on the loop counter (c1 in our case)
  < +      Add 1 to c0
  > -      Subtract 1 from c1
  ]        End your loops with the cell pointer on the loop counter

  At this point our program has added 5 to 2 leaving 7 in c0 and 0 in c1
  but we cannot output this value to the terminal since it is not ASCII encoded

  To display the ASCII character "7" we must add 48 to the value 7
  We use a loop to compute 48 = 6 * 8

  ++++ ++++  c1 = 8 and this will be our loop counter again
  [
  < +++ +++  Add 6 to c0
  > -        Subtract 1 from c1
  ]
  < .        Print out c0 which has the value 55 which translates to "7"!
`;

export const helloWorld = `
  ++++++++[>++++[>++>+++>+++>+<<<<-]>
  +>+>->>+[<]<-]>>.>---.+++++++..+++.
  >>.<-.<.+++.------.--------.>>+.>++.
`;

export const rot13 = `
  -,+[                         Read first character and start outer character reading loop
      -[                       Skip forward if character is 0
          >>++++[>++++++++<-]  Set up divisor (32) for division loop
                                 (MEMORY LAYOUT: dividend copy remainder divisor quotient zero zero)
          <+<-[                Set up dividend (x minus 1) and enter division loop
              >+>+>-[>>>]      Increase copy and remainder / reduce divisor / Normal case: skip forward
              <[[>+<-]>>+>]    Special case: move remainder back to divisor and increase quotient
              <<<<<-           Decrement dividend
          ]                    End division loop
      ]>>>[-]+                 End skip loop; zero former divisor and reuse space for a flag
      >--[-[<->+++[-]]]<[         Zero that flag unless quotient was 2 or 3; zero quotient; check flag
          ++++++++++++<[       If flag then set up divisor (13) for second division loop
                                 (MEMORY LAYOUT: zero copy dividend divisor remainder quotient zero zero)
              >-[>+>>]         Reduce divisor; Normal case: increase remainder
              >[+[<+>-]>+>>]   Special case: increase remainder / move it back to divisor / increase quotient
              <<<<<-           Decrease dividend
          ]                    End division loop
          >>[<+>-]             Add remainder back to divisor to get a useful 13
          >[                   Skip forward if quotient was 0
              -[               Decrement quotient and skip forward if quotient was 1
                  -<<[-]>>     Zero quotient and divisor if quotient was 2
              ]<<[<<->>-]>>    Zero divisor and subtract 13 from copy if quotient was 1
          ]<<[<<+>>-]          Zero divisor and add 13 to copy if quotient was 0
      ]                        End outer skip loop (jump to here if ((character minus 1)/32) was not 2 or 3)
      <[-]                     Clear remainder from first division if second division was skipped
      <.[-]                    Output ROT13ed character from copy and clear it
      <-,+                     Read next character
  ]                            End character reading loop
`;
